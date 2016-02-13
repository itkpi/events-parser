'use strict'

const fs = require('fs-extra')
const xml2json = require('xml2json')
const http = require('http')
const request = require('sync-request')
_log_('Start')

let adress = [ // xml-file name, link
  ['dou_ua_online', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/online']
]
let adr = 0 // TODO: for-cycle

/**
 * Get xml-data from sources
 */
let res = request('GET', adress[adr][1])
fs.writeFileSync(__dirname + '/xml/' + adress[adr][0] + '.xml', res.getBody())

/**
 * Save old file
 */
fs.copySync(__dirname + '/json/new_' + adress[adr][0] + '.json', __dirname + '/json/old_' + adress[adr][0] + '.json')

/**
 * XML to JSON
 */
let data = fs.readFileSync(__dirname + '/xml/' + adress[adr][0] + '.xml')
let result = xml2json.toJson(data, {sanitize: false})
fs.writeFileSync(__dirname + '/json/new_' + adress[adr][0] + '.json', result)

/**
 * Add new event
 */
let newData = fs.readJsonSync(__dirname + '/json/new_' + adress[adr][0] + '.json', {throws: false})
let oldData = fs.readJsonSync(__dirname + '/json/old_' + adress[adr][0] + '.json', {throws: false})

if (newData.rss.channel.item[0].title ===
    oldData.rss.channel.item[0].title) return _log_('UP TO DATE')

let newI = newData.rss.channel.item
let oldI = oldData.rss.channel.item

let num = 0 // # останнього нового запису
for (num; num < oldI.length; num++) {
  if (oldI[0].link === newI[num].link) {
    num -= 1
    break
  }
}

/**
 * RSS to API
 */
while (num >= 0) {
  let newID = newI[num].description

  let title, agenda, place, registration_url, image_url, only_date, when_start
  switch (newData.rss.channel.link) {
    case 'http://dou.ua/calendar/':
      title = newI[num].title.replace(/(,)\s[0-9]{1,2}(.)+/g, '')

      agenda = newID.substring(newID.indexOf('h', 70), newID.indexOf('"', 150)) + // mini picture
                newID.substring(newID.indexOf('p', newID.indexOf('М', 250)) + 4) // other

      place = newID.substring(newID.indexOf('М', 250) + 27, newID.indexOf('p', newID.indexOf('М', 250)) - 2)
      if (place.toLowerCase() === 'online') place = 'Онлайн'

      registration_url = 'http://ITKPI.PP.UA/'
      image_url = ''
      only_date = false

      let month = {
        января: '01',
        февраля: '02',
        марта: '03',
        апреля: '04',
        мая: '05',
        июня: '06',
        июля: '07',
        августа: '08',
        сентября: '09',
        октября: '10',
        ноября: '11',
        декабря: '12'
      }
      let today = new Date()
      let dd = newID.substring(newID.indexOf('Д', 200) + 15, newID.indexOf(' ', newID.indexOf('Д', 200) + 15))
      let mm_now = today.getMonth() + 1 // January is 0!
      let mm = month[newID.substring(newID.indexOf('Д', 200) + 17, newID.indexOf(' ', newID.indexOf('Д', 200) + 17))]
      let yyyy = today.getFullYear()
      if (dd < 10) dd = '0' + dd
      if (mm_now > mm) yyyy += 1

      when_start = yyyy + '-' + mm + '-' + dd
      let time = newID.substring(newID.indexOf('Н', 250) + 17, newID.indexOf('b', newID.indexOf('Н', 250) + 17) - 1)
      if (time.length < 6) {
        when_start += ' ' + time
      } else {
        only_date = true
      }

      break
  }

  /**
   * Send event to EventMonkey
   */
  let body = JSON.stringify({
    title: '_T_E_S_T_ 3' + title,
    agenda: agenda,
    social: '',
    place: place,
    registration_url: registration_url,
    image_url: image_url,
    level: 'NONE',
    when_start: when_start,
    when_end: when_start, // ОБОВ’ЯЗКОВЕ ПОЛЕ, МАТЬ ЙОГО!
    only_date: only_date,
    team: 'ITKPI',
    submitter_email: 'vm@itkpi.pp.ua'
  })

  let request = new http.ClientRequest({
    hostname: 'eventsmonkey.itkpi.pp.ua',
    port: 80,
    path: '/api/v1/suggested_events',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body)
    }
  })

  request.end(body)
  num -= 1
}
_log_('Done all')

function _log_ (log) {
  let d = new Date()
  let date = d.getDate()
  fs.appendFile(__dirname + '/logs/' + date + '.txt', d.toTimeString() + ': ' + log + '\n', (err) => {
    if (err) throw err
  })
}
