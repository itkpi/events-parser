/**
 * Main file which distributes tasks.
 */

'use strict'

const fs = require('fs-extra')
const yandex = require('yandex-translate')(process.env.YANDEX_TRANSLATE_KEY)
const path = require('path')

const parse = require('./data/parse')
const inBlackList = require('./data/blackList').inBlackList
const dataIO = require('./data/dataIO')
const transform = require('./data/transform')
const src = require('./src')

const _log_ = require('./utils')._log_
const utils = require('./utils')

_log_('Start', 'onlyCron')
fs.ensureDirSync('./logs/')

for (let adr = 0; adr < src.address.length; adr++) {
  const srcFrom = src.address[adr][0]
  const srcName = `${srcFrom}_${src.address[adr][1]}`
  const srcType = src.types[srcFrom]
  const srcLink = src.address[adr][2]

  _log_(`Start ${srcName}`, 'onlyCron')

  // Paths to auxiliary files
  const newJSON = path.join(__dirname, 'json', `${srcName}_new.json`)
  const oldJSON = path.join(__dirname, 'json', `${srcName}_old.json`)

  const getNewData = dataIO.get(srcName, srcType, srcLink, newJSON, oldJSON)

  if (!getNewData) continue

  // Read data
  const newSrc = dataIO.read(srcFrom, newJSON)
  const oldSrc = dataIO.read(srcFrom, oldJSON)

  // Find new events
  let eventsPosition = dataIO.eventsPosition(srcFrom, newSrc, oldSrc)

  // RSS to API
  while (eventsPosition.length) {
    let title = dataIO.title(srcFrom, newSrc, eventsPosition)
    const link = dataIO.link(srcFrom, newSrc, eventsPosition)
    const data = dataIO.data(srcFrom, newSrc, eventsPosition)

    _log_(`${srcName}: ${link} start\n`)

    // Parse event description
    title = parse.title(srcFrom, title)
    let agenda = parse.agenda(srcFrom, data)
    let whenStart = parse.startDate(srcFrom, data)
    let whenEnd = parse.endDate(srcFrom, data)

    if (inBlackList(title, agenda, whenStart, `${link}\n${title}`)) {
      eventsPosition.shift()
      continue
    }

    let social = parse.social(srcFrom, data, link, title, agenda)
    let place = parse.place(srcFrom, data)
    const regUrl = parse.regUrl(srcFrom, data)
    const imgUrl = parse.imgUrl(srcFrom, data)
    let onlyDate = parse.startTime(srcFrom, data)

    if (onlyDate !== true) {
      whenStart += onlyDate
      whenEnd += parse.endTime(srcFrom, data)
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
      dataIO.sendtoAPI(title, agenda, social, place, regUrl, imgUrl, whenStart, whenEnd, onlyDate, srcName)

      return Promise.resolve()
    })
    eventsPosition.shift()
  }
}
_log_('End', 'onlyCron')
