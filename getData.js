'use strict'

const fs = require('fs-extra')
const request = require('sync-request')
const xml2json = require('xml2json')
const _log_ = require('./log.js')._log_

exports.get = (srcName, srcType, srcLink, newJSON, oldJSON) => {
  // Check for the existence files
  fs.ensureFileSync(newJSON)
  fs.ensureFileSync(oldJSON)

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
    return false
  }
  return true
}

exports.read = (srcName, data) => {
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      return (data = data.rss.channel.item)
    case 'meetup_open_events':
      return (data = data.results)
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in getData.read`)
      return ''
  }
}

exports.eventsPosition = (srcName, newI, oldI) => {
  let eventsPosition = []
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      for (let i = 0; i < oldI.length; i++) {
        if (oldI[0].link === newI[i].link) break

        eventsPosition.push(i)
      }
      break
    case 'meetup_open_events':
      for (let i = 0; i < oldI.length; i++) {
        if (oldI[0].name === newI[i].name) break

        eventsPosition.push(i)
      }
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in getData.eventsPosition`)
  }
  return eventsPosition
}
