/**
 * These functions work with data input/output or pick part of it.
 */

'use strict'

const fs = require('fs-extra')
const request = require('sync-request')
const xml2json = require('xml2json')
const http = require('http')
const _log_ = require('../utils.js')._log_

const firstEvent = 0

/**
 * Get new data from sources.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {string} srcType - datatype of current source.
 * @param {string} srcLink - link to actual data of source.
 * @param {string} newJSON - path to JSON file with data of current iteration.
 * @param {string} oldJSON - path to JSON file with data of previous iteration.
 * @returns {boolean} 'true' if new events are present. Otherwise return 'false'.
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
      res = xml2json.toJson(res.getBody(), {'sanitize': false})
      fs.writeFileSync(newJSON, res)
      break
    case 'json':
      fs.writeFileSync(newJSON, res.getBody())
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in get.get`)
  }

  const old = fs.readFileSync(oldJSON)

  if (old == '') { // not rewrite to '==='
    _log_(`${srcName}: INIT`)

    return false
  }

  return true
}

/**
 * Read JSON file.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {string} file - path to JSON file with data of current iteration.
 * @returns {JSON} data - JSON only with events.
 */
exports.read = (srcName, file) => {
  let data = fs.readJsonSync(file, {'throws': false})

  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      data = data.rss.channel.item
      break
    case 'meetup_open_events':
      data = data.results
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in get.read`)
  }

  return data
}

/**
 * Search position of new events.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {JSON} newSrc - JSON file with actual state of information.
 * @param {JSON} oldSrc - JSON file with previous state of information.
 * @returns {Array} eventsPosition - position of new events.
 */
exports.eventsPosition = (srcName, newSrc, oldSrc) => {
  let eventsPosition = []

  switch (srcName) {
    case 'dou_ua_online':
    case 'dou_ua_kyiv':
      for (let i = 0; i < oldSrc.length; i++) {
        if (oldSrc[firstEvent].link === newSrc[i].link) break

        eventsPosition.push(i)
      }
      break
    case 'meetup_open_events':
      for (let i = 0; i < oldSrc.length; i++) {
        if (oldSrc[firstEvent].name === newSrc[i].name) break

        eventsPosition.push(i)
      }
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in get.eventsPosition`)
  }

  return eventsPosition
}

/**
 * Return title of event.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {JSON} src - JSON source file.
 * @param {Array} eventsPosition - array with position of new events.
 * @returns {string} title - event title.
 */
exports.title = (srcName, src, eventsPosition) => {
  let title = 'TITLE (dataIO error)'

  switch (srcName) {
    case 'dou_ua_kyiv':
    case 'dou_ua_online':
      title = src[eventsPosition[firstEvent]].title
      break
    case 'meetup_open_events':
      title = src[eventsPosition[firstEvent]].name
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in dataIO.title`)
  }

  return title
}

/**
 * Return link to source of the event.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {JSON} src - JSON source file.
 * @param {Array} eventsPosition - array with position of new events.
 * @returns {string} link - link of the event.
 */
exports.link = (srcName, src, eventsPosition) => {
  let link = 'https://LINK.dataIO/error/'

  switch (srcName) {
    case 'dou_ua_kyiv':
    case 'dou_ua_online':
      link = src[eventsPosition[firstEvent]].link
      break
    case 'meetup_open_events':
      link = src[eventsPosition[firstEvent]].event_url
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in dataIO.link`)
  }

  return link
}

/**
 * Return information about one event.
 * @param {string} srcName - name of source, which is currently being processed.
 * @param {JSON} src - JSON source file.
 * @param {Array} eventsPosition - array with position of new events.
 * @returns {string} data - information of the event.
 */
exports.data = (srcName, src, eventsPosition) => {
  let data = 'DATA (dataIO error)'

  switch (srcName) {
    case 'dou_ua_kyiv':
    case 'dou_ua_online':
      data = src[eventsPosition[firstEvent]].description.replace(/[\n,\u2028]/g, '')
      break
    case 'meetup_open_events':
      data = JSON.stringify(src[eventsPosition[firstEvent]])
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcName} in dataIO.data`)
  }

  return data
}

/**
 * Send event to API.
 */
exports.sendtoAPI = (title, agenda, social, place, regUrl, imgUrl, whenStart, onlyDate, srcName) => {
  const body = JSON.stringify({
    'title': title.toString(),
    'agenda': agenda.toString(),
    'social': `<i>From: ${srcName}</i> ${social.toString()}`,
    'place': place.toString(),
    'registration_url': regUrl,
    'image_url': imgUrl,
    'level': 'NONE',
    'when_start': whenStart,
    'when_end': whenStart, // Required field... // TODO: Need to change API
    'only_date': onlyDate,
    'team': 'ITKPI',
    'submitter_email': 'TEST_VM@ITKPI.PP.UA'
  })

  const options = {
    'hostname': process.env.HOSTNAME_URL,
    'port': 80,
    'path': '/api/v1/suggested_events',
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body)
    }
  }

  const req = http.request(options, (res) => {
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
