/**
 * These functions parse info from source.
 */

'use strict'

const moment = require('moment')

const _log_ = require('../utils.js')._log_
const locale = require('../utils.js').locale

/**
 * Find Title field of the event.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} title.
 */
exports.title = (srcName, src) => {
  let title = 'TITLE (parser error)'

  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      title = src.replace(/(,)\s[0-9]{1,2}(.)+/g, '')
      break
    case 'meetup_open_events':
      title = src
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.title`)
  }

  return title
}

/**
 * Find Agenda field of the event.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} agenda.
 */
exports.agenda = (srcName, src) => {
  let agenda = 'AGENDA (parser error)'

  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      agenda = src.replace(/.+?(Место|Місце|Place):<\/strong>.+?<\/p>(.+)<\/div>/, '$2')
      break
    case 'meetup_open_events':
      return JSON.parse(src).description
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.agenda`)

      return agenda
  }
  if (agenda.length === src.length) {
    _log_(`ERROR: ${srcName} have parsing problem in parse.agenda\n${src}`)
  }

  return agenda
}

/**
 * Create Social field of the event.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @param {string} link - link to source event.
 * @param {string} title - title field of the event.
 * @param {string} agenda - agenda field of the event.
 * @returns {string} social.
 */
exports.social = (srcName, src, link, title, agenda) => {
  let social = 'SOCIAL (parser error)'

  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      social = `<a href="${link}">ORIGINAL POST</a> | \
<a href="https://www.google.com.ua/searchbyimage?newwindow=1&site=search\
&image_url=${src.replace(/.+?<img src="(.+?)"\sstyle.+/, '$1')}" \
target="_blank">SEARCH IMAGE</a><br/>${title}<br/>${agenda}`
      break
    case 'meetup_open_events':
      // TODO: image_url
      social = `<a href="${link}">ORIGINAL POST</a> | \
<br/>${title}<br/>${agenda}`
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.social`)
  }

  return social
}

/**
 * Find Place field of the event.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} place.
 */
exports.place = (srcName, src) => {
  let place = 'PLACE (parser error)'

  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      place = src.replace(/.+?(Место|Місце|Place):<\/strong>\s(.+?)<\/p>.+/, '$2')
      break
    case 'meetup_open_events':
      return `${JSON.parse(src).venue.address_1} (${JSON.parse(src).venue.name})`
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.place`)

      return place
  }

  if (place.toLowerCase() === 'online' || place.toLowerCase() === 'онлайн') return 'Онлайн'

  // 0 == false, if str.indexOf('s') not found 's' - return -1
  const giveFalse = 1

  if (place.toLowerCase().indexOf('online') + giveFalse ||
      place.toLowerCase().indexOf('онлайн') + giveFalse) {
    place = place.replace(/(O|o)nline|(О|о)нлайн/, 'Онлайн + $`$\'')
  }

  if (place.length === src.length) {
    _log_(`ERROR: ${srcName} have parsing problem in parse.place\n${src}`)
  }

  return place
}

/**
 * Find Registration url of the event.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} registration url.
 */
exports.regUrl = (srcName, src) => {
  let regUrl = 'http://PARSER.ERROR/RegUrl'

  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      // TODO: find registration url
      regUrl = 'http://ITKPI.PP.UA/'
      break
    case 'meetup_open_events':
      regUrl = JSON.parse(src).event_url
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.regUrl`)
  }

  return regUrl
}

/**
 * Find Image url of the event.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} image url.
 */
exports.imgUrl = (srcName, src) => {
  let imgUrl = 'http://PARSER.ERROR/ImgUrl'

  // TODO: find image_url
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
    case 'meetup_open_events':
      imgUrl = ''
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.imgUrl`)
  }

  return imgUrl
}

/**
 * Find Date of the event.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} date when start.
 */
exports.date = (srcName, src) => {
  let date = '1970-01-01'

  const today = new Date()
  let yyyy = today.getFullYear()
  let dd, mm
  // January is 0!
  const mmStartFromZero = 1
  const mmNow = today.getMonth() + mmStartFromZero


  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      dd = src.replace(/.+?Дата:<\/strong>\s(\d{1,2}).+/, '$1')
      mm = src.replace(/.+?Дата:<\/strong>\s\d{1,2}(\s—\s\d{1,2})?\s([а-я,a-z,A-Z,А-Я]+).+/, '$2')

      moment.locale(locale(mm))
      mm = moment(mm, 'MMMM').get('month') + 1
      break
    case 'meetup_open_events':
      dd = new Date(JSON.parse(src).time).getDate()
      mm = new Date(JSON.parse(src).time).getMonth()
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.whenStart`)

      return date
  }

  if (dd.length === src.length || mm.length === src.length) {
    _log_(`ERROR: ${srcName} have parsing problem in parse.whenStart\n${src}`)

    return date
  }

  if (mmNow > mm) yyyy += 1

  date = `${yyyy}-${mm}-${dd}`

  return date
}

/**
 * Find Time of the event.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string|boolean} time when start. If event have only date - return true.
 */
exports.time = (srcName, src) => {
  let time = '00:00'

  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      time = src.replace(/.+?(Начало|Время|Time|Start|Час|Початок):<\/strong>\s(\d{2}:\d{2}).+/, '$2')
      break
    case 'meetup_open_events':
      const dayInMilliseconds = 86400000
      const t = new Date(JSON.parse(src).time % dayInMilliseconds)

      time = `${t.getUTCHours()}:${t.getUTCMinutes()}`
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.time`)

      return time
  }

  if (time.length === src.length) {
    _log_(`ERROR: ${srcName} have parsing problem in parse.time\n${src}`)

    return time
  }

  const validTimeLength = 5

  if (time.length <= validTimeLength) return ` ${time}`

  return true
}
