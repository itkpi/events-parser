'use strict'

const fs = require('fs-extra')
const request = require('sync-request')
const xml2json = require('xml2json')
const _log_ = require('./log.js')._log_

exports.getNewData = (srcName, srcType, srcLink, newJSON, oldJSON) => {
  // Check for the existence files
  let ensures = [
    fs.ensureFile(newJSON, (err) => { if (err) throw err }),
    fs.ensureFile(oldJSON, (err) => { if (err) throw err })
  ]

  Promise.all(ensures)
  .then(() => {
    // Save old data
    fs.copySync(newJSON, oldJSON)
    // Get data from source
    let res = request('GET', srcLink)

    switch (srcType) {
      case 'xml':
        let result = xml2json.toJson(res.getBody(), {sanitize: false})
        fs.writeFileSync(newJSON, result)
        break
      case 'json':
        fs.writeFileSync(newJSON, res.getBody())
        break
    }

    let old = fs.readFileSync(oldJSON)
    if (old == '') { // not rewrite to '==='
      _log_(`${srcName}: INIT`)
    }
  })
  .catch((err) => { _log_(err) })
}
