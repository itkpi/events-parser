/**
 * Utils functions.
 */

'use strict'

const fs = require('fs-extra')
const moment = require('moment')
const cronLog = require('console').Console

/**
 * Custom logging tool. Save logs to file and print them to console (for cron logs)
 * @param {string} log - message which need logging.
 * @param {string} name - custom file name for current log.
 */
exports._log_ = (log, name) => {
  const d = new Date()

  if (!name) {
    // January is 0!
    const mmStartFromZero = 1

    name = d.getMonth() + mmStartFromZero
    if (name < 10) name = `0${name}`
  }

  fs.appendFile(`./logs/${d.getFullYear()}_${name}`, `${d}: ${log}\n`, (err) => {
    if (err) throw err
  })

  cronLog(log)
}

/**
 * Determination of language of the event by title of the month.
 * Have exports value: lang.
 * @returns {string} language.
 */
exports.locale = (mm) => {
  moment.locale('ru')
  if (!isNaN(moment(mm, 'MMMM').get('month'))) {
    exports.lang = 'ru'
    return exports.lang
  }

  moment.locale('uk')
  if (!isNaN(moment(mm, 'MMMM').get('month'))) {
    exports.lang = 'uk'
    return exports.lang
  }

  exports.lang = 'en'
  return exports.lang
}
