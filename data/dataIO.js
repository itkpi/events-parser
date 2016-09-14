/**
 * These functions work with data input/output or pick part of it.
 */

'use strict'

const fs = require('fs-extra')
const request = require('sync-request')
const xml2json = require('xml2json')
const http = require('http')
const _log_ = require('../utils.js')._log_

const dataIO = {}
module.exports = dataIO

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
dataIO.get = (srcName, srcType, srcLink, newJSON, oldJSON) => {
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
      _log_(`ERROR: NOT FOUND ${srcType} in dataIO.get`)
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
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {string} file - path to JSON file with data of current iteration.
 * @returns {JSON} data - JSON only with events.
 */
dataIO.read = (srcFrom, file) => {
  let data = fs.readJsonSync(file, {'throws': false})

  switch (srcFrom) {
    case 'dou':
      data = data.rss.channel.item
      break
    case 'meetup':
      data = data.results
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcFrom} in dataIO.read`)
  }

  return data
}

/**
 * Search position of new events.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} newSrc - JSON file with actual state of information.
 * @param {JSON} oldSrc - JSON file with previous state of information.
 * @returns {Array} eventsPosition - position of new events.
 */
dataIO.eventsPosition = (srcFrom, newSrc, oldSrc) => {
  let eventsPosition = []

  switch (srcFrom) {
    case 'dou':
      for (let i = 0; i < oldSrc.length; i++) {
        if (oldSrc[firstEvent].link === newSrc[i].link) break

        eventsPosition.push(i)
      }
      break
    case 'meetup':
      for (let i = 0; i < oldSrc.length; i++) {
        if (oldSrc[firstEvent].name === newSrc[i].name) break

        eventsPosition.push(i)
      }
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcFrom} in dataIO.eventsPosition`)
  }

  return eventsPosition
}

/**
 * Return title of event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} file - JSON source file.
 * @param {Array} eventsPosition - array with position of new events.
 * @returns {string} title - event title.
 */
dataIO.title = (srcFrom, file, eventsPosition) => {
  let title = 'TITLE (dataIO error)'

  switch (srcFrom) {
    case 'dou':
      title = file[eventsPosition[firstEvent]].title
      break
    case 'meetup':
      title = file[eventsPosition[firstEvent]].name
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcFrom} in dataIO.title`)
  }

  return title
}

/**
 * Return link to source of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} file - JSON source file.
 * @param {Array} eventsPosition - array with position of new events.
 * @returns {string} link - link of the event.
 */
dataIO.link = (srcFrom, file, eventsPosition) => {
  let link = 'https://LINK.dataIO/error/'

  switch (srcFrom) {
    case 'dou':
      link = file[eventsPosition[firstEvent]].link
      break
    case 'meetup':
      link = file[eventsPosition[firstEvent]].event_url
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcFrom} in dataIO.link`)
  }

  return link
}

/**
 * Return information about one event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} file - JSON source file.
 * @param {Array} eventsPosition - array with position of new events.
 * @returns {string} data - information of the event.
 */
dataIO.data = (srcFrom, file, eventsPosition) => {
  let data = 'DATA (dataIO error)'

  switch (srcFrom) {
    case 'dou':
      data = file[eventsPosition[firstEvent]].description.replace(/[\n,\u2028]/g, '')
      break
    case 'meetup':
      data = JSON.stringify(file[eventsPosition[firstEvent]])
      break
    default:
      _log_(`ERROR: NOT FOUND ${srcFrom} in dataIO.data`)
  }

  return data
}

/**
 * Send event to API.
 */
dataIO.sendtoAPI = (title, agenda, social, place, regUrl, imgUrl, whenStart, onlyDate, srcName) => {
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
    'submitter_email': process.env.EMAIL
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
