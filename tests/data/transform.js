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
