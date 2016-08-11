/**
 * Utils functions.
 */

'use strict'

const fs = require('fs-extra')
const moment = require('moment')

/**
 * Custom logging tool. Print logs to cron and save them to file (if name !== 'onlyCron')
 * @param {string} log - message which need logging.
 * @param {string} name - custom file name for current log.
 */
exports._log_ = (log, name) => {
  console.log(log)
  if (name === 'onlyCron') return

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
}

/**
 * Determination of language of the event by title of the month.
 * Have exports value: lang.
 * @returns {string} language.
 */
// TODo: Rewrite through iterator
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
