/**
 * Utils functions.
 */

'use strict'

const fs = require('fs-extra')
const moment = require('moment')
const spawn = require('child_process').spawn

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
  const now = new Date()
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth() + 1
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
 * @returns {number} days in curent month.
 */
Date.prototype.daysInMonth = function () {
  return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate()
}

/**
 * Constructor. Run command in shell.
 * @param {string} cmd - command name.
 * @param {Array of strings} args - command's arguments.
 * @param {string} cbStdout - callback with returned string.
 * @param {number} cbEnd - callback with exit status code.
 */
function RunInShell (cmd, args, cbStdout, cbEnd) {
  const child = spawn(cmd, args)
  const self = this
  // Send a cb to set 1 when cmd exits
  self.exit = 0
  self.stdout = ''
  child.stdout.on('data', (data) => { cbStdout(self, data) })
  child.stdout.on('end', () => { cbEnd(self) })
}

/**
 * This is wrapper function for easly work with RunInShell function.
 * @param {string} cmd - command name.
 * @param {Array of strings} args - command's arguments.
 * @returns {Object} RunInShell.
 */
function RIS (cmd, args) {
  return new RunInShell(cmd, args,
    (self, data) => { self.stdout += data.toString().slice(0, -1) },
    (self) => { self.exit = 1 }
  )
}

const describe = RIS('git', ['describe'])
const branch = RIS('git', ['rev-parse', '--abbrev-ref', 'HEAD'])

/**
 * Getting build version based on 'git tags' and curent branch.
 * Patern: vMAJOR.MINOR.PATH-%branch name%-%number of commits from last tag%-%commit hash%.
 * Example: v0.5.0-vesioning-8-g65cc3b3.
 * @returns {string} version - curent build version.
 */
utils.getVersion = () => {
  const ds = describe.stdout.split('-')
  const version = ds.length === 1
    ? `${ds[0]}-${branch.stdout}`
    : `${ds[0]}-${branch.stdout}-${ds[1]}-${ds[2]}`

  return version
}
