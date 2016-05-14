'use strict'

const moment = require('moment')

exports.locale = (mm) => {
  moment.locale('ru')
  if (!isNaN(moment(mm, 'MMMM').get('month'))) {
    return (exports.lang = 'ru')
  }

  moment.locale('uk')
  if (!isNaN(moment(mm, 'MMMM').get('month'))) {
    return (exports.lang = 'uk')
  }

  return (exports.lang = 'en')
}
