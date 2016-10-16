/**
 * These functions parse info from source.
 */

'use strict'

const moment = require('moment')

const _log_ = require('../utils.js')._log_
const locale = require('../utils.js').locale

const parse = {}
module.exports = parse

/**
 * Find Title field of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} title.
 */
parse.title = (srcFrom, src) => {
  const key = {
    dou: "src.replace(/(,)\\s[0-9]{1,2}(.)+/g, '')",
    meetup: 'src'
  }

  let title = eval(key[srcFrom])

  return title
}

/**
 * Find Agenda field of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} agenda.
 */
parse.agenda = (srcFrom, src) => {
  const key = {
    dou: "src.replace(/.+?(Место|Місце|Place):<\\/strong>.+?<\\/p>(.+)<\\/div>/, '$2')",
    meetup: 'JSON.parse(src).description'
  }

  let agenda = eval(key[srcFrom])

  if (agenda.length === src.length) _log_(`ERROR: ${srcFrom} have parsing problem in parse.agenda\n${src}`)

  return agenda
}

/**
 * Create Social field of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @param {string} link - link to source event.
 * @param {string} title - title field of the event.
 * @param {string} agenda - agenda field of the event.
 * @returns {string} social.
 */
parse.social = (srcFrom, src, link, title, agenda) => {
  const key = {
    dou: `<a href="${link}">ORIGINAL POST</a> | \
<a href="https://www.google.com.ua/searchbyimage?newwindow=1&site=search\
&image_url=${src.replace(/.+?<img src="(.+?)"\\sstyle.+/, '$1')}" \
target="_blank">SEARCH IMAGE</a><br/>${title}<br/>${agenda}`,

    meetup: `<a href="${link}">ORIGINAL POST</a> | <br/>${title}<br/>${agenda}`
  }

  let social = key[srcFrom]

  return social
}

/**
 * Find Place field of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} place.
 */
parse.place = (srcFrom, src) => {
  const key = {
    dou: "src.replace(/.+?(Место|Місце|Place):<\\/strong>\\s(.+?)<\\/p>.+/, '$2')",
    meetup: '`${JSON.parse(src).venue.address_1} (${JSON.parse(src).venue.name})`'
  }

  let place = eval(key[srcFrom])

  if (place.toLowerCase() === 'online' || place.toLowerCase() === 'онлайн') return 'Онлайн'

  // 0 == false, if str.indexOf('s') not found 's' - return -1
  const giveFalse = 1

  if (place.toLowerCase().indexOf('online') + giveFalse ||
      place.toLowerCase().indexOf('онлайн') + giveFalse) {
    place = place.replace(/(.*),? ?((O|o)nline|(О|о)нлайн)(.*)/, 'Онлайн + $1$5')
  }

  if (place.length === src.length) {
    _log_(`ERROR: ${srcFrom} have parsing problem in parse.place\n${src}`)
  }

  return place
}

/**
 * Find Registration url of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} regUrl - registration url.
 */
parse.regUrl = (srcFrom, src) => {
  const key = {
    dou: "'http://ITKPI.PP.UA/'", // TODO: find registration url
    meetup: 'JSON.parse(src).event_url'
  }

  let regUrl = eval(key[srcFrom])

  return regUrl
}

/**
 * Find Image url of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} imgUrl - image url.
 */
parse.imgUrl = (srcFrom, src) => {
  const key = {
    dou: '',
    meetup: ''
  }

  let imgUrl = key[srcFrom]

  return imgUrl
}

/**
 * Find Date of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} date when start.
 */
parse.date = (srcFrom, src) => {
  const key = {
    dou:
      "dd = src.replace(/.+?(Дата|Date):<\\/strong>\\s(\\d{1,2}).+/, '$2')\
      ;mm = src.replace(/.+?(Дата|Date):<\\/strong>\\s\\d{1,2}(\\s—\\s\\d{1,2})?\\s([а-я,a-z,A-Z,А-Я]+).+/, '$3')\
      ;moment.locale(locale(mm))\
      ;mm = moment(mm, 'MMMM').get('month') + mmStartFromZero",
    meetup:
      "dd = new Date(JSON.parse(src).time).getDate()\
      ;mm = new Date(JSON.parse(src).time).getMonth() + mmStartFromZero"
  }

  let date = '9999-09-09'

  const today = new Date()
  let yyyy = today.getFullYear()
  let dd, mm
  // January is 0!
  const mmStartFromZero = 1
  const mmNow = today.getMonth() + mmStartFromZero

  eval(key[srcFrom])

  if (dd.length === src.length || mm.length === src.length) {
    _log_(`ERROR: ${srcFrom} have parsing problem in parse.whenStart\n${src}`)

    return date
  }

  if (mmNow > mm) yyyy += 1

  date = `${yyyy}-${mm}-${dd}`

  return date
}

/**
 * Find Time of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string|boolean} time when start. If event have only date - return true.
 */
parse.time = (srcFrom, src) => {
  const key = {
    dou: "src.replace(/.+?(Начало|Время|Time|Start|Час|Початок):<\\/strong>\\s(\\d{2}:\\d{2}).+/, '$2')",
    meetup:
      "const dayInMillisec = 86400000\
      ;const t = new Date(JSON.parse(src).time % dayInMillisec)\
      ;`${t.getUTCHours()}:${t.getUTCMinutes()}`"
  }

  let time = eval(key[srcFrom])

  if (time.length === src.length && srcFrom !== 'dou') {
    _log_(`ERROR: ${srcFrom} have parsing problem in parse.time\n${src}`)
  }

  const validTimeLength = 5

  if (time.length <= validTimeLength) return ` ${time}`

  return true
}
