'use strict'

const assert = require('assert')
const transform = require('../../data/transform.js')
const _log_ = require('../../utils.js')._log_

/**
 * assertData - function for simplyfy add new test examples
 * @param {string} method - method from transform.js, what tested
 * @param {string} newData - string with data, what you want to get after transforms
 * @param {Array} rawDataArray - array of objects, with data for transform
 * @returns {boolean} true or crash on test
 */

function assertData (method, needData, rawDataArray) {
  const start = new Date()

  rawDataArray.forEach((rawData) => {
    const transData = transform[method](rawData.data)
    assert.strictEqual(needData, transData, `
method: transform.${method}
test: ${rawData.name}
expect:
${needData}

get:
${transData}

raw:
${rawData.data}
`)
  })

  const secWork = (new Date() - start) / 1000
  _log_(`transform.${method} passed all ${rawDataArray.length} tests by ${secWork}s`)

  return true
}

const titleOK = 'Automated testing in DevOps'
const titleRaw = [{
  name: 'Remove words "free" and "webinar" [1]',
  data: 'Бесплатный вебиНар Automated testing in DevOps'
}, {
  name: 'Remove words "free" and "webinar" [2]',
  data: 'Automated вебіНаро testing безКоштовне in DevOps'
}, {
  name: 'Remove words "free" and "webinar" [3]',
  data: 'webinars webinar Automated testing in DevOps free'
}, {
  name: 'Remove quotation mark',
  data: '“Automated »testing in" ”DevOps’“”"«»‘„“'
}, {
  name: 'Remove useless spaces',
  data: ' Automated   testing   in  DevOps  '
}, {
  name: 'Remove dots in the end [1]',
  data: 'Automated testing in DevOps..........'
}, {
  name: 'Remove dots in the end [2]',
  data: 'Automated testing in DevOps...вебіНаро.......'
}, {
  name: 'Combo',
  data: 'Бесплатный webinars    вебиНар"« “Automated testing безКоштовно in вебинаРНО DevOps..”   free"„“    '
}]

assertData('title', titleOK, titleRaw)
