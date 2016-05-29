'use strict'

const moment = require('moment')

const _log_ = require('./log.js')._log_
const locale = require('./locale.js').locale

exports.title = (srcName, src) => {
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      return src.replace(/(,)\s[0-9]{1,2}(.)+/g, '')
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.title`)
      return 'TITLE (parser error)'
  }
}

exports.agenda = (srcName, src) => {
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      return src.replace(/.+?Место:<\/strong>.+?<\/p>(.+)<\/div>/, '$1')
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.agenda`)
      return 'AGENDA (parser error)'
  }
}

exports.social = (srcName, src, link, title, agenda) => {
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      return `<a href="${link}">ORIGINAL POST</a> | \
<a href="https://www.google.com.ua/searchbyimage?newwindow=1&site=search\
&image_url=${src.replace(/.+?<img src="(.+?)"\sstyle.+/, '$1')}" \
target="_blank">SEARCH IMAGE</a><br/>${title}<br/>${agenda}`
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.social`)
      return 'SOCIAL (parser error)'
  }
}

exports.place = (srcName, src) => {
  let place
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      place = src.replace(/.+?(Место|Місце|Place):<\/strong>\s(.+?)<\/p>.+/, '$2'); break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.place`)
      return 'PLACE (parser error)'
  }

  if (place.toLowerCase() === 'online' || place.toLowerCase() === 'онлайн') return 'Онлайн'

  if (place.toLowerCase().indexOf('online') + 1 ||
      place.toLowerCase().indexOf('онлайн') + 1) {
    place = place.replace(/(O|o)nline|(О|о)нлайн/, "Онлайн + $`$'")
  }

  return place
}

exports.regUrl = (srcName, src) => {
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      return 'http://ITKPI.PP.UA/'
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.regUrl`)
      return 'http://PARSER.ERROR/RegUrl'
  }
}

exports.imgUrl = (srcName, src) => {
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
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
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.whenStart`)
      return '1970-01-01 00:00'
  }

  moment.locale(locale(mm))
  mm = moment(mm, 'MMMM').get('month') + 1

  if (mmNow > mm) yyyy += 1

  whenStart = `${yyyy}-${mm}-${dd}`

  return whenStart
}

exports.time = (srcName, src) => {
  let time
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      time = src.replace(/.+?(Начало|Time|Час):<\/strong>\s(\d{2}:\d{2}).+/, '$2'); break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in parse.time`)
      return '1970-01-01 00:00'

  }

  if (time.length < 6) return ` ${time}`

  return true
}
