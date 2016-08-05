/**
 * Main file which distributes tasks.
 */

'use strict'

const fs = require('fs-extra')
const yandex = require('yandex-translate')(process.env.YANDEX_TRANSLATE_KEY)
const path = require('path')
const cronLog = require('console').Console

const parse = require('./data/parse.js')
const inBlackList = require('./data/blackList.js').inBlackList
const dataIO = require('./data/dataIO.js')
const transform = require('./data/transform.js')

const _log_ = require('./utils.js')._log_
const locale = require('./utils.js').locale

cronLog('Start')
fs.ensureDirSync('./logs/')

const address = [
  // srcName, srcType, srcLink
  ['dou_ua_online', 'xml', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/online'],
  ['dou_ua_kyiv', 'xml', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/%D0%9A%D0%B8%D0%B5%D0%B2'],
  ['meetup_open_events', 'json', process.env.MEETUP_OPEN_EVENTS]
]

for (let adr = 0; adr < address.length; adr++) {
  const srcName = address[adr][0]

  cronLog(`Start ${srcName}`)

  // Paths to auxiliary files
  const newJSON = path.join(__dirname, 'json', `new_${srcName}.json`)
  const oldJSON = path.join(__dirname, 'json', `old_${srcName}.json`)

  const getNewData = dataIO.get(srcName, address[adr][1], address[adr][2], newJSON, oldJSON)

  if (!getNewData) continue

  // Read data
  const newI = dataIO.read(srcName, newJSON)
  const oldI = dataIO.read(srcName, oldJSON)

  // Find new events
  let eventsPosition = dataIO.eventsPosition(srcName, newI, oldI)

  // RSS to API
  while (eventsPosition.length) {
    const eventTitle = dataIO.eventTitle(srcName, newI, eventsPosition)
    const eventLink = dataIO.eventLink(srcName, newI, eventsPosition)
    const newID = dataIO.newID(srcName, newI, eventsPosition)

    _log_(`${srcName}: ${eventLink} start\n`)

    // Parse event description
    let title = parse.title(srcName, eventTitle)
    let agenda = parse.agenda(srcName, newID)

    if (inBlackList(title, agenda, `${eventLink}\n${eventTitle}`)) {
      eventsPosition.shift()
      continue
    }

    let social = parse.social(srcName, newID, eventLink, title, agenda)
    let place = parse.place(srcName, newID)
    const regUrl = parse.regUrl(srcName, newID)
    const imgUrl = parse.imgUrl(srcName, newID)
    let whenStart = parse.date(srcName, newID)
    let onlyDate = parse.time(srcName, newID)

    if (onlyDate !== true) {
      whenStart += onlyDate
      onlyDate = false
    }

    // Delete superfluous words
    title = transform.title(title)
    agenda = transform.agenda(agenda)
    social = transform.social(social)
    place = transform.place(place)

    if (agenda.length > 7000) {
      agenda = '<h1>Too many. Do we really need this?</h1>'
    }

    // Translate
    let ya = new Promise((resolve, reject) => {
      if (locale.lang === 'ru') {
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
cronLog('End')
