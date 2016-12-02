/**
 * Utils functions.
 */

'use strict'

const fs = require('fs-extra')
const moment = require('moment')

const utils = {}
module.exports = utils

fs.ensureDir('./logs/', (err) => { if (err) throw err })

/**
 * Custom logging tool. Print logs to cron and save them to file (if name !== 'onlyCron')
 * @param {string} log - message which need logging.
 * @param {string} name - custom file name for current log.
 */
utils._log_ = (log, name) => {
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
utils.locale = (mm) => {
  moment.locale('ru')
  if (!isNaN(moment(mm, 'MMMM').get('month'))) {
    utils.lang = 'ru'
    return utils.lang
  }

  moment.locale('uk')
  if (!isNaN(moment(mm, 'MMMM').get('month'))) {
    utils.lang = 'uk'
    return utils.lang
  }

  utils.lang = 'en'
  return utils.lang
}

/**
 * Date generator for ain links.
 * @param {number} num - what month from now we need.
 * @returns {string} date in 'year-month' format. 
 */
utils.ainGetMonth = (num) => {
  const nowYear = new Date().getFullYear()
  const nowMonth = new Date().getMonth() + 1
  let month = nowMonth + num
  let year = nowYear
  while (month > 12) {
    year += 1
    month -= 12
  }
  if (month < 10) month = '0' + month
  const date = `${year}-${month}`

  return date
}


/**
 * @returns {number} days in curent month
 */
Date.prototype.daysInMonth = function () {
  return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate()
}
