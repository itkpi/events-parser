/**
 * These functions parse info from source.
 */

'use strict'

const moment = require('moment')
const cheerio = require('cheerio')

const _log_ = require('../utils.js')._log_
const locale = require('../utils.js').locale
const giveConfig = require('../src.js').config

const parse = {}
module.exports = parse

/**
 * Find Title field of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} title.
 */
parse.title = (srcFrom, src) => {
  return eval(giveConfig[srcFrom].title)
}

/**
 * Find Agenda field of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} agenda.
 */
parse.agenda = (srcFrom, src) => {
  const agenda = eval(giveConfig[srcFrom].agenda)

  if (srcFrom === 'dou' && agenda.length === src.length) {
    _log_(`ERROR: ${srcFrom} have parsing problem in parse.agenda\n${src}`)
  }

  return agenda
}

/**
 * Create additional information field of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @param {string} link - link to source event.
 * @param {string} title - title field of the event.
 * @param {string} agenda - agenda field of the event.
 * @returns {string} addInfo.
 */
parse.addInfo = (srcFrom, src, link, title, agenda) => {
  return eval(giveConfig[srcFrom].addInfo)
}

/**
 * Find Place field of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} place.
 */
parse.place = (srcFrom, src) => {
  let place = eval(giveConfig[srcFrom].place)

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
  return eval(giveConfig[srcFrom].registration)
}

/**
 * Find Image url of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} imgUrl - image url.
 */
parse.imgUrl = (srcFrom, src) => {
  return eval(giveConfig[srcFrom].image)
}

/**
 * Find Price of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @returns {string} price - event price.
 */
parse.price = (srcFrom, src) => {
  return eval(giveConfig[srcFrom].price)
}

/**
 * Find Date of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @param {hash} key to find event-time
 * @returns {string} date when start.
 */
parse.date = (srcFrom, src, key) => {
  return eval(giveConfig[srcFrom][key])
}

/**
 * Find Time of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @param {hash} key to find event-time
 * @returns {string|boolean} time when start. If event have only date - return true.
 */
parse.time = (srcFrom, src, key) => {
  const time = eval(giveConfig[srcFrom][key])

  if (time.length === src.length && srcFrom !== 'dou') {
    _log_(`ERROR: ${srcFrom} have parsing problem in parse.time\n${src}`)
  }

  const validTimeLength = 5

  if (time.length <= validTimeLength) return ` ${time}`

  return true
}

/**
 * Extract data from JSON by path
 * @param {JSON} src - JSON of current event.
 * @param {string} path - path to data from root in src
 * @returns {string} data
 */
function byPath (src, path) {
  let data = JSON.parse(src)

  if (typeof path === 'string' || typeof path === 'symbol') return data[path]
  if (!path) return data

  for (let key of path) {
    data = data[key]
  }

  return data
}

/**
 * Find date by milliseconds
 * @param {JSON} src - JSON of current event.
 * @param {string} path to milliseconds from root in src
 * @returns {string} date in format yyyy-mm-dd
 */
function dateFromMilliseconds (src, path) {
  const mmStartFromZero = 1 // January is 0!
  const now = new Date(byPath(src, path))
  const dd = now.getDate()
  const mm = now.getMonth() + mmStartFromZero
  const yyyy = now.getFullYear()

  const date = `${yyyy}-${mm}-${dd}`

  return date
}

/**
 * Find date in DOU-event
 * @param {JSON} src - JSON of current event.
 * @returns {string} date in format yyyy-mm-dd
 */
function dateFromDOU (src) {
  let date = '9999-09-09'
  const today = new Date()

  let yyyy = today.getFullYear()
  const dd = src.replace(/.+?(Дата|Date):<\/strong>\s(\d{1,2}).+/, '$2')
  let mm = src.replace(/.+?(Дата|Date):<\/strong>\s\d{1,2}(\s—\s\d{1,2})?\s([а-я,a-z,A-Z,А-Я]+).+/, '$3')

  const mmStartFromZero = 1 // January is 0!
  const mmNow = today.getMonth() + mmStartFromZero

  moment.locale(locale(mm))
  mm = moment(mm, 'MMMM').get('month') + mmStartFromZero

  if (dd.length === src.length || mm.length === src.length) {
    _log_(`ERROR: DOU has parsing problem in parse.whenStart\n${src}`)

    return date
  }

  if (mmNow > mm) yyyy += 1

  date = `${yyyy}-${mm}-${dd}`

  return date
}

/**
 * @param {JSON} src - JSON of current event.
 * @param {string} path - path to data from root in src
 * @param {} greaterThanMS - how many API time greater than milliseconds
 * @returns {string} time in format HH:MM 24h
 */
function timeFromMilliseconds (src, path, greaterThanMS) {
  greaterThanMS = greaterThanMS || 1 // Vagga can't in NodeJS 6 -_-.
  const MSinDay = 86400000
  const time = new Date((byPath(src, path) * greaterThanMS) % MSinDay)

  return time
}

/**
 * Find title + price of Ain event.
 * @param {JSON} src - JSON of current event.
 * @param {string} price - event price.
 * @returns {string} name - event title.
 */
function ainTitle (src) {
  const name = src('h1').text() || ''

  return name
}

/**
 * Find date of Ain event.
 * @param {JSON} src - JSON of current event.
 * @param {string} srcName - event date in YYYY=MM format.
 * @returns {string} - event date in YYYY-MM-DD format.
 */
function ainDate (src) {
  let date = '9999-09-09'
  const today = new Date()
  const eventDate = src('.event-head').find('time').eq(0)
    .attr('datetime').replace(/[^А-Яа-я0-9.:/$-]/g, '')
  let yyyy = today.getFullYear()
  const dd = eventDate.slice(-2)
  let mm = eventDate.slice(0, -2)

  const mmStartFromZero = 1 // January is 0!
  const mmNow = today.getMonth()

  moment.locale(locale(mm))
  mm = moment(mm, 'MMMM').get('month') + mmStartFromZero

  if (dd.length === src.length || mm.length === src.length) {
    _log_(`ERROR: AIN has parsing problem in parse.whenStart\n${src}`)

    return date
  }

  if (mmNow > mm) yyyy += 1

  date = `${yyyy}-${mm}-${dd}`

  return date
}

/**
 * Find time of Ain event.
 * @param {JSON} src - JSON of current event.
 * @returns {string} time - event time in HH:MM format.
 */
function ainTime (src) {
  const time = src('.event-head').find('time').eq(1).attr('datetime')
  ? src('.event-head').find('time').eq(1).attr('datetime')
    .replace(/(<span>|<\/span>)/g, '').slice(1, 6)
  : '00:00'
  
  return time
}

/**
 * Find place of Ain event.
 * @param {JSON} src - JSON of current event.
 * @returns {string} time - event place.
 */
function ainPlace (src) {
  const place = src('div.ven').next().text() === 'Онлайн'
  ? 'Онлайн'
  : src('div.ven').next().text() + ' ' + src('.address-marker').text()

  return place
}

/**
 * Find price of Ain event.
 * @param {JSON} src - JSON of current event.
 * @returns {string} time - event price.
 */
function ainPrice (src) {
  const price = src('.event-head').find('a').parent().next().text()
    .replace(/[^A-Za-z0-9:/$ -]/g, '').replace(/\\n/g, ' ')

  return price
}
