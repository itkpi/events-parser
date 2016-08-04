/**
 * Utils functions.
 */

'use strict'

const fs = require('fs-extra')
const moment = require('moment')

/**
 * Custom logging tool. Save logs to file and print them to console (for cron logs)
 */
exports._log_ = (log, name) => {
  let d = new Date()
  if (!name) {
    name = d.getMonth() + 1
    if (name < 10) name = `0${name}`
  }

  fs.appendFile(`./logs/${d.getFullYear()}_${name}`, `${d}: ${log}\n`, (err) => {
    if (err) throw err
  })

  console.log(log)
}

/**
 * Determination of language of the event by title of the month.
 */
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