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
    meetup:       'src',
    bigCityEvent: 'src',
    fb:           'src',
    ain:          'src'
  }

  const title = eval(key[srcFrom])

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
    meetup:       "byPath(src, 'description')",
    bigCityEvent: "byPath(src, 'description')",
    fb:           "byPath(src, 'description')",
    ain:          "byPath(src, 'agenda')"
  }

  const agenda = eval(key[srcFrom])

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

    meetup:       `<a href="${link}">ORIGINAL POST</a> | <br/>${title}<br/>${agenda}`,
    bigCityEvent: `<a href="${link}">ORIGINAL POST</a> | <br/>${title}<br/>${agenda}`,
    fb:           `<a href="${link}">ORIGINAL POST</a> | <br/>${title}<br/>${agenda}`,
    ain:          `<a href="${link}">ORIGINAL POST</a> | <br/>${title}<br/>${agenda}`
  }

  const social = key[srcFrom]

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
    meetup: "`${byPath(src, ['venue', 'address_1'])} (${byPath(src, ['venue', 'name'])})`",
    // First value can be rudiment: BigCityEvent work only in Kyiv
    bigCityEvent: "`${byPath(src, ['place', 'location', 'city'])}, ${byPath(src, ['place', 'location', 'street'])}`",
    fb: "`${byPath(src, ['place', 'location', 'city'])}, ${byPath(src, ['place', 'location', 'street'])}`",
    ain: "`${byPath(src, 'place')}`"
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
    dou:          "'http://ITKPI.PP.UA/'",
    meetup:       "byPath(src, 'event_url')",
    bigCityEvent: "byPath(src, 'link')",
    fb:           "`https://fb.com/${byPath(src, 'id')}`",
    ain:          "`${byPath(src, 'regUrl')}`"
  }

  const regUrl = eval(key[srcFrom])

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
    dou:          '',
    meetup:       '',
    bigCityEvent: '',
    fb:           '',
    ain: "`${byPath(src, 'imgUrl')}`"
  }

  const imgUrl = key[srcFrom]

  return imgUrl
}

/**
 * Find Date of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @param {hash} key to find event-time
 * @returns {string} date when start.
 */
function date (srcFrom, src, key) {
  const date = eval(key[srcFrom])

  return date
}

parse.startDate = (srcFrom, src) => {
  const key = {
    dou:          'dateFromDOU(src)',
    meetup:       "dateFromMilliseconds(src, 'time')",
    bigCityEvent: "dateFromMilliseconds(src, 'eventTimestamp')",
    fb:           "dateFromMilliseconds(src, 'start_time')",
    ain:          "dateFromMilliseconds(src, 'date')"
  }

  const startDate = date(srcFrom, src, key)

  return startDate
}


parse.endDate = (srcFrom, src) => {
  const key = {
    dou:          'dateFromDOU(src)',
    meetup:       "dateFromMilliseconds(src, 'time')",
    bigCityEvent: "dateFromMilliseconds(src, 'eventTimestamp')",
    fb:           "dateFromMilliseconds(src, 'end_time')",
    ain:          "dateFromMilliseconds(src, 'date')"
  }

  const endDate = date(srcFrom, src, key)

  return endDate
}

/**
 * Find Time of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} src - JSON of current event.
 * @param {hash} key to find event-time
 * @returns {string|boolean} time when start. If event have only date - return true.
 */
function time (srcFrom, src, key) {
  let time = eval(key[srcFrom])

  if (time.length === src.length && srcFrom !== 'dou') {
    _log_(`ERROR: ${srcFrom} have parsing problem in parse.time\n${src}`)
  }

  const validTimeLength = 5

  if (time.length <= validTimeLength) return ` ${time}`

  return true
}

parse.startTime = (srcFrom, src) => {
  const key = {
    dou: "src.replace(/.+?(Начало|Время|Time|Start|Час|Початок):<\\/strong>\\s(\\d{2}:\\d{2}).+/, '$2')",
    meetup:       "timeFromMilliseconds(src, 'time')",
    bigCityEvent: "timeFromMilliseconds(src, 'eventTimestamp', 1000)",
    fb:           "timeFromMilliseconds(src, 'start_time')",
    ain:          "timeFromMilliseconds(src, 'date')"
  }

  const startTime = time(srcFrom, src, key)

  return startTime
}

parse.endTime = (srcFrom, src) => {
  const key = {
    dou: "src.replace(/.+?(Начало|Время|Time|Start|Час|Початок):<\\/strong>\\s(\\d{2}:\\d{2}).+/, '$2')",
    meetup:       "timeFromMilliseconds(src, 'time')",
    bigCityEvent: "timeFromMilliseconds(src, 'eventTimestamp', 1000)",
    fb:           "timeFromMilliseconds(src, 'end_time')",
    ain:          "timeFromMilliseconds(src, 'date')"
  }

  const endTime = time(srcFrom, src, key)

  return endTime
}

/**
 * Extract data from JSON by path
 * @param {JSON} src - JSON of current event.
 * @param {string} path - path to data from root in src
 * @returns {string} data
 */
function byPath (src, path) {
  let data = JSON.parse(src)

  if (typeof (path) === 'string' ||
      typeof (path) === 'symbol') return data[path]
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
  const dd = new Date(byPath(src, path)).getDate()
  const mm = new Date(byPath(src, path)).getMonth() + mmStartFromZero
  const yyyy = new Date(byPath(src, path)).getFullYear()

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
    _log_(`ERROR: DOU have parsing problem in parse.whenStart\n${src}`)

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
