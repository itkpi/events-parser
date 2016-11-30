/**
 * These functions work with data input/output or pick part of it.
 */

'use strict'

const fs = require('fs-extra')
const request = require('sync-request')
const cheerio = require("cheerio")
const xml2json = require('xml2json')
const http = require('http')
const _log_ = require('../utils.js')._log_
const giveConfig = require('../src.js').config

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
dataIO.get = (srcFrom, srcName, srcType, srcLink, newJSON, oldJSON) => {
  // Check for the existence files
  fs.ensureFileSync(newJSON)
  fs.ensureFileSync(oldJSON)

  // Save old data
  fs.copySync(newJSON, oldJSON)

  // Get data from source
  let res = request('GET', srcLink).getBody()
  if (srcFrom === 'ain') res = ainGetLinks(res)

  switch (srcType) {
    case 'xml':
      res = xml2json.toJson(res.getBody(), {'sanitize': false})
      fs.writeFileSync(newJSON, res)
      break
    case 'json':
      const readableBody = JSON.stringify(JSON.parse(res))
      fs.writeFileSync(newJSON, readableBody)
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
  data = eval(giveConfig[srcFrom].allEvents)

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

  for (let i = 0; i < oldSrc.length; i++) {
    if (oldSrc[firstEvent][giveConfig[srcFrom].NUEeventId] ===
        newSrc[i][giveConfig[srcFrom].NUEeventId]) break

    eventsPosition.push(i)
  }

  return eventsPosition
}

/**
 * Return link to source of the event.
 * @param {string} srcFrom - source, which is currently being processed.
 * @param {JSON} file - JSON source file.
 * @param {Array} eventsPosition - array with position of new events.
 * @returns {string} link - link of the event.
 */
dataIO.link = (srcFrom, file, eventsPosition) => {
  let link = file[eventsPosition[firstEvent]][giveConfig[srcFrom].NUEsrcLink]

  if (srcFrom === 'bigCityEvent') link = `http://bigcityevent.com/api/v1/event/${link}`
  if (srcFrom === 'fb') link = `https://fb.com/${link}`

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
  let data = file[eventsPosition[firstEvent]]
  data = eval(giveConfig[srcFrom].eventData)

  return data
}

/**
 * Send event to API.
 */
dataIO.sendtoAPI = (title, agenda, social, place, regUrl, imgUrl, whenStart, whenEnd, onlyDate, srcName) => {
  const body = JSON.stringify({
    'title': title.toString(),
    'agenda': agenda.toString(),
    'social': `<i>From: ${srcName}</i> ${social.toString()}`,
    'place': place.toString(),
    'registration_url': regUrl,
    'image_url': imgUrl,
    'level': 'NONE',
    'when_start': whenStart,
    'when_end': whenEnd, // Required field... // TODO: Need to change API
    'only_date': onlyDate,
    'team': 'ITKPI',
    'submitter_email': process.env.EMAIL
  })

  const options = {
    'hostname': process.env.HOSTNAME_URL,
    'port': process.env.HOSTNAME_PORT,
    'path': process.env.HOSTNAME_PATH,
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

/**
 * Get event link from Ain calendar.
 * @param {Raw} res - requested calendar page.
 * @returns {JSON} file - list of events links.
 */
function ainGetLinks (res) {
  let file = []
  let linkPos = 1

  let month = cheerio.load(res.toString())

  while (true) {
    let event = {
      link: ''
    }
    event.link += month('.date-items').find('a').eq(linkPos).attr('href')
    if (event.link === 'undefined' || event.link === '#') {
      break
    }

    if (event.link.slice(21, 25) !== '2016') {
      file.push(event)
    }
    linkPos++
  }

  return JSON.stringify(file)
}

/**
 * Get event data from Ain links list.
 * @param {JSON} data - list of events links.
 * @returns {Raw} data - event data.
 */
function ainGetData (data) {
  data = cheerio.load(request('GET', data.link).getBody().toString())

  return data
}
