/**
 * Main file which distributes tasks.
 */

'use strict'

const fs = require('fs-extra')
const yandex = require('yandex-translate')(process.env.YANDEX_TRANSLATE_KEY)
const path = require('path')

const parse = require('./data/parse.js')
const inBlackList = require('./data/blackList.js').inBlackList
const dataIO = require('./data/dataIO.js')
const transform = require('./data/transform.js')

const _log_ = require('./utils.js')._log_
const utils = require('./utils.js')

_log_('Start', 'onlyCron')
fs.ensureDirSync('./logs/')

const address = [
  // srcName, srcType, srcLink
  ['dou_ua_online', 'xml', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/online'],
  ['dou_ua_kyiv', 'xml', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/%D0%9A%D0%B8%D0%B5%D0%B2'],
  ['meetup_open_events', 'json', process.env.MEETUP_OPEN_EVENTS]
]

for (let adr = 0; adr < address.length; adr++) {
  const srcName = address[adr][0].slice(0, address[adr][0].indexOf('_'))

  _log_(`Start ${srcName}`, 'onlyCron')

  // Paths to auxiliary files
  const newJSON = path.join(__dirname, 'json', `new_${srcName}.json`)
  const oldJSON = path.join(__dirname, 'json', `old_${srcName}.json`)

  const getNewData = dataIO.get(srcName, address[adr][1], address[adr][2], newJSON, oldJSON)

  if (!getNewData) continue

  // Read data
  const newSrc = dataIO.read(srcName, newJSON)
  const oldSrc = dataIO.read(srcName, oldJSON)

  // Find new events
  let eventsPosition = dataIO.eventsPosition(srcName, newSrc, oldSrc)

  // RSS to API
  while (eventsPosition.length) {
    let title = dataIO.title(srcName, newSrc, eventsPosition)
    const link = dataIO.link(srcName, newSrc, eventsPosition)
    const data = dataIO.data(srcName, newSrc, eventsPosition)

    _log_(`${srcName}: ${link} start\n`)

    // Parse event description
    title = parse.title(srcName, title)
    let agenda = parse.agenda(srcName, data)

    if (inBlackList(title, agenda, `${link}\n${title}`)) {
      eventsPosition.shift()
      continue
    }

    let social = parse.social(srcName, data, link, title, agenda)
    let place = parse.place(srcName, data)
    const regUrl = parse.regUrl(srcName, data)
    const imgUrl = parse.imgUrl(srcName, data)
    let whenStart = parse.date(srcName, data)
    let onlyDate = parse.time(srcName, data)

    if (onlyDate !== true) {
      whenStart += onlyDate
      onlyDate = false
    }

    // Delete superfluous words
    title = transform.title(title)
    agenda = transform.agenda(agenda)
    social = transform.social(social)
    place = transform.place(place)

    // Yandex Translate can translate a little more 7000 symbols per request.
    const translateMax = 7000

    if (agenda.length > translateMax) {
      agenda = '<h1>Too many. Do we really need this?</h1>'
    }

    // Translate
    let ya = new Promise((resolve, reject) => {
      if (utils.lang === 'ru') {
        yandex.translate(agenda, {'from': 'ru', 'to': 'uk'}, (err, res) => {
          if (err) throw err
          agenda = res.text
          yandex.translate(title, {'from': 'ru', 'to': 'uk'}, (err, res) => {
            if (err) throw err
            title = res.text
            yandex.translate(place, {'from': 'ru', 'to': 'uk'}, (err, res) => {
              if (err) throw err
              place = res.text

              return resolve()
            })
          })
        })
      } else {
        return resolve()
      }
    })

    // Send event to API
    ya.then(() => {
      dataIO.sendtoAPI(title, agenda, social, place, regUrl, imgUrl, whenStart, onlyDate, srcName)

      return Promise.resolve()
    })
    eventsPosition.shift()
  }
}
_log_('End', 'onlyCron')
