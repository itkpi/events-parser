/**
 * Main file which distributes tasks.
 */

'use strict'

const yandex = require('yandex-translate')(process.env.YANDEX_TRANSLATE_KEY)
const path = require('path')

const parse = require('./data/parse')
const inBlackList = require('./data/blackList').inBlackList
const dataIO = require('./data/dataIO')
const transform = require('./data/transform')
const src = require('./src')

const _log_ = require('./utils')._log_
const utils = require('./utils')

new Promise((resolve, reject) => {
  setTimeout(() => {
    _log_(`Start ${utils.getVersion()}`, 'onlyCron')
    resolve()
  }, 10)
}).then(() => {
  Promise.all([
    // srcFrom, srcName, srcLink
    run(['dou', 'ONLINE', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/online']),
    run(['dou', 'KYIV', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/%D0%9A%D0%B8%D0%B5%D0%B2']),
    run(['meetup', 'OPEN_EVENTS', process.env.MEETUP_OPEN_EVENTS]),
    run(['fb', 'PROJECTOR', `https://graph.facebook.com/prjctrcomua/events?access_token=${process.env.FB_ACCESS_TOKEN}`]),
    run(['fb', 'HUB.4.0', `https://graph.facebook.com/HUB.4.0/events?access_token=${process.env.FB_ACCESS_TOKEN}`]),
    run(['fb', 'MS', `https://graph.facebook.com/ITproCommunity/events?access_token=${process.env.FB_ACCESS_TOKEN}`]),
    run(['fb', 'ЧИТАЛКА', `https://graph.facebook.com/cybcoworking/events?access_token=${process.env.FB_ACCESS_TOKEN}`]),
    run(['ain', `${utils.ainGetMonth(0)}`, `http://ain.ua/events/${utils.ainGetMonth(0)}`]),
    run(['ain', `${utils.ainGetMonth(1)}`, `http://ain.ua/events/${utils.ainGetMonth(1)}`])
  ])

  function run (source) {
    const srcFrom = source[0]
    const srcName = `${srcFrom}_${source[1]}`
    const srcType = src.config[srcFrom].NUEsrcType
    const srcLink = source[2]

    _log_(`Start ${srcName}`, 'onlyCron')

    // Paths to auxiliary files
    const newJSON = path.join(__dirname, 'json', `${srcName}_new.json`)
    const oldJSON = path.join(__dirname, 'json', `${srcName}_old.json`)

    const getNewData = dataIO.get(srcName, srcType, srcLink, newJSON, oldJSON)
    // if (!getNewData) continue

    // Read data
    const newSrc = dataIO.read(srcFrom, newJSON)
    const oldSrc = dataIO.read(srcFrom, oldJSON)

    // Find new events
    let eventsPosition = dataIO.eventsPosition(srcFrom, newSrc, oldSrc)

    // RSS to API
    while (eventsPosition.length) {
      const link = dataIO.link(srcFrom, newSrc, eventsPosition)
      const data = dataIO.data(srcFrom, newSrc, eventsPosition)

      _log_(`${srcName}: ${link} start\n`)

      // Parse event description
      let title = parse.title(srcFrom, data)
      let agenda = parse.agenda(srcFrom, data)
      let whenStart = parse.date(srcFrom, data, 'dateStart')
      let whenEnd = parse.date(srcFrom, data, 'dateEnd')

      if (inBlackList(title, agenda, whenStart, `${link}\n${title}`)) {
        eventsPosition.shift()
        continue
      }

      let addInfo = parse.addInfo(srcFrom, data, link, title, agenda)
      let place = parse.place(srcFrom, data)
      const regUrl = parse.regUrl(srcFrom, data)
      const imgUrl = parse.imgUrl(srcFrom, data)
      const price = parse.price(srcFrom, data)
      let onlyDate = parse.time(srcFrom, data, 'timeStart')

      if (onlyDate !== true) {
        whenStart += onlyDate
        whenEnd += parse.time(srcFrom, data, 'timeEnd')
        onlyDate = false
      }

      // Delete superfluous words
      title = transform.title(title)
      agenda = transform.agenda(agenda)
      addInfo = transform.addInfo(addInfo)
      place = transform.place(place)

      // Yandex Translate can translate a little more 7000 symbols per request.
      const translateMax = 7000

      if (agenda.length > translateMax) {
        agenda = '<h1>Too many. Do we really need this?</h1>'
      }

      // Translate
      if (utils.lang === 'ru') {
        Promise.all([
          translate(place),
          translate(agenda),
          translate(title)
        ])
        // Send event to API
        .then((tr) => {
          place = tr[0] // fucking vagga -_-
          agenda = tr[1]
          title = tr[2]
          dataIO.sendtoAPI(title, agenda, addInfo, place, regUrl, imgUrl, whenStart, whenEnd, onlyDate, srcName, price)
        })
      } else {
        dataIO.sendtoAPI(title, agenda, addInfo, place, regUrl, imgUrl, whenStart, whenEnd, onlyDate, srcName, price)
      }
      eventsPosition.shift()
    }
  }
  _log_('End', 'onlyCron')

  /**
   * Return translate text
   * @param {string} src - source text, which is currently being processed.
   * @returns {string} res.text - translate source text
   */
  function translate (src) {
    return new Promise((resolve, reject) => {
      yandex.translate(src, {'from': 'ru', 'to': 'uk'}, (err, res) => {
        if (err) reject(err)
        resolve(res.text[0])
      })
    })
  }
})
.catch((err) => { _log_(err); throw err })
