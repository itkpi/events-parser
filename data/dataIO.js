/**
 * These functions work with data input/output or pick part of it.
 */

'use strict'

const fs = require('fs-extra')
const request = require('sync-request')
const xml2json = require('xml2json')
const http = require('http')
const _log_ = require('../utils.js')._log_

/**
 * Get new data from sources.
 * Return 'true' if new events are present. Otherwise return 'false'.
 */
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

/**
 * Read JSON file.
 * Return JSON only with events.
 */
exports.read = (srcName, data) => {
  fs.readJsonSync(data, {throws: false})
  console.log(data)
  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      return (data = data.rss.channel.item)
    case 'meetup_open_events':
      return (data = data.results)
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in get.read`)
      return ''
  }
}

/**
 * Search position of new events.
 * Return array with position of new events.
 */
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
      _log_(`ERROR: NOT FOUND ${srcName} in get.eventsPosition`)
  }
  return eventsPosition
}

/**
 * Returns path to event title.
 */
exports.eventTitle = (srcName, newI, eventsPosition) => {
  switch (srcName) {
    case 'dou_ua_kyiv':
    case 'dou_ua_online':
      return newI[eventsPosition[0]].title
    case 'meetup_open_events':
      return newI[eventsPosition[0]].name
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in eventLink`)
  }
}

/**
 * Returns path to link of the event.
 */
exports.eventLink = (srcName, newI, eventsPosition) => {
  switch (srcName) {
    case 'dou_ua_kyiv':
    case 'dou_ua_online':
      return newI[eventsPosition[0]].link
    case 'meetup_open_events':
      return newI[eventsPosition[0]].event_url
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in eventLink`)
  }
}

/**
 * Returns path to description of the event.
 */
exports.newID = (srcName, newI, eventsPosition) => {
  switch (srcName) {
    case 'dou_ua_kyiv':
    case 'dou_ua_online':
      return newI[eventsPosition[0]].description.replace(/[\n,\u2028]/g, '')
    case 'meetup_open_events':
      return JSON.stringify(newI[eventsPosition[0]])
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in eventLink`)
  }
}

/**
 * Send event to API.
 */
exports.sendtoAPI = (title, agenda, social, place, regUrl, imgUrl, whenStart, onlyDate, srcName) => {
  let body = JSON.stringify({
    title: title.toString(),
    agenda: agenda.toString(),
    social: `<i>From: ${srcName}</i> ${social.toString()}`,
    place: place.toString(),
    registration_url: regUrl,
    image_url: imgUrl,
    level: 'NONE',
    when_start: whenStart,
    when_end: whenStart, // Required field... // TODO: Need to change API
    only_date: onlyDate,
    team: 'ITKPI',
    submitter_email: 'VM@ITKPI.PP.UA'
  })

  let options = {
    hostname: process.env.HOSTNAME_URL,
    port: 80,
    path: '/api/v1/suggested_events',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body)
    }
  }
  let req = http.request(options, (res) => {
    if (res.statusCode !== 201) {
      _log_(`HEADERS: ${JSON.stringify(res.headers)}`)
      res.setEncoding('utf8')
      res.on('data', (chunk) => { _log_(`BODY: ${chunk}`) })
      res.on('end', () => { _log_('No more data in response. \n') })
    }
  })
  req.on('error', (e) => { _log_(`problem with request: ${e.message}`) })

  req.write(body)
  req.end()
}