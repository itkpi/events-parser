/**
 * These functions parse info from source.
 */

'use strict'

const moment = require('moment')

const _log_ = require('../utils.js')._log_
const locale = require('../utils.js').locale


exports.title = (srcName, src) => {
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      return src.replace(/(,)\s[0-9]{1,2}(.)+/g, '')
    case 'meetup_open_events':
      return src
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.title`)

      return 'TITLE (parser error)'
  }
}

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

exports.social = (srcName, src, link, title, agenda) => {
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      return `<a href="${link}">ORIGINAL POST</a> | \
<a href="https://www.google.com.ua/searchbyimage?newwindow=1&site=search\
&image_url=${src.replace(/.+?<img src="(.+?)"\sstyle.+/, '$1')}" \
target="_blank">SEARCH IMAGE</a><br/>${title}<br/>${agenda}`
    case 'meetup_open_events':
      // TODO: image_url
      return `<a href="${link}">ORIGINAL POST</a> | \
<br/>${title}<br/>${agenda}`
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.social`)

      return 'SOCIAL (parser error)'
  }
}

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

  if (place.toLowerCase().indexOf('online') + 1 ||
      place.toLowerCase().indexOf('онлайн') + 1) {
    place = place.replace(/(O|o)nline|(О|о)нлайн/, 'Онлайн + $`$\'')
  }

  if (place.length === src.length) {
    _log_(`ERROR: ${srcName} have parsing problem in parse.place\n${src}`)
  }

  return place
}

exports.regUrl = (srcName, src) => {
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      return 'http://ITKPI.PP.UA/'
    case 'meetup_open_events':
      return JSON.parse(src).event_url
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.regUrl`)
      return 'http://PARSER.ERROR/RegUrl'
  }
}

exports.imgUrl = (srcName, src) => {
  // TODO: find image_url
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
    case 'meetup_open_events':
      return ''
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.imgUrl`)
      return 'http://PARSER.ERROR/ImgUrl'
  }
}

exports.whenStart = (srcName, src) => {
  let today = new Date()
  let mmNow = today.getMonth() + 1 // January is 0!
  let yyyy = today.getFullYear()
  let dd, mm, whenStart

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
      return '1970-01-01 00:00'
  }

  if (dd.length === src.length || mm.length === src.length) {
    _log_(`ERROR: ${srcName} have parsing problem in parse.whenStart\n${src}`)
    return '1970-01-01'
  }

  if (mmNow > mm) yyyy += 1

  whenStart = `${yyyy}-${mm}-${dd}`

  return whenStart
}

exports.time = (srcName, src) => {
  let time = '1970-01-01 00:00'

  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      time = src.replace(/.+?(Начало|Время|Time|Start|Час|Початок):<\/strong>\s(\d{2}:\d{2}).+/, '$2'); break
    case 'meetup_open_events':
      let t = new Date(JSON.parse(src).time % 86400000)
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
  if (time.length < 6) return ` ${time}`

  return true
}
