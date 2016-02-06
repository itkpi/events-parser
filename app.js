'use strict'

const fs = require('fs')
const xml2json = require('xml2json')
const http = require('http')
_log_('Start')

let adress = [ // xml-file name, link
  ['dou_ua_online', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/online']
]
let adr = 0 // TODO: for-cycle

/**
 * Get xml-data from sources DISABLE FOR TESTS
 */
http.get(adress[adr][1], (res) => {
  // _log_(`Got response: ${res.statusCode}`)
  fs.writeFile(__dirname + '/xml/' + adress[adr][0] + '.xml', '', (err) => {
    if (err) { _log_(err); throw err }
     // _log_('Done: clear ' + adress[adr][0] + '.xml')
  })

  res.on('data', function (chunk) {
    fs.appendFile(__dirname + '/xml/' + adress[adr][0] + '.xml', chunk, (err) => {
      if (err) { _log_(err); throw err }
       // _log_('Done: write chunk of ' + adress[adr][0] + '.xml')
    })
  })
}).on('error', (e) => {
  // _log_(`Got error: ${e.message}`)
})
/**
 * XML to JSON
 */
fs.readFile(__dirname + '/xml/' + adress[adr][0] + '.xml', (err, data) => { // TODO: https://toster.ru/q/199773
  if (err) { _log_(err); throw err }

  let result = xml2json.toJson(data, {sanitize: false})

  fs.writeFile(__dirname + '/json/new_' + adress[adr][0] + '.json', result, (err) => {
    if (err) { _log_(err); throw err }
  })
})
/**
 * Save old file DISABLE FOR TESTS
 */
fs.readFile(__dirname + '/json/new_' + adress[adr][0] + '.json', (err, data) => {
  if (err) { _log_(err); throw err }

  fs.writeFile(__dirname + '/json/old_' + adress[adr][0] + '.json', data, (err) => {
    if (err) { _log_(err); throw err }
    // _log_('Done: write old file')
  })
  // _log_('Done: read old file')
})



/**
* Add new event
*/
fs.readFile(__dirname + '/json/new_' + adress[adr][0] + '.json', (err, new_data) => {
  if (err) { _log_(err); throw err }

  fs.readFile(__dirname + '/json/old_' + adress[adr][0] + '.json', (err, old_data) => {
    if (err) { _log_(err); throw err }

    let newData = JSON.parse(new_data)
    let oldData = JSON.parse(old_data)
    // setTimeout(null, 2000)

    if (newData.rss.channel.lastBuildDate ===
        oldData.rss.channel.lastBuildDate) return _log_('UP TO DATE')

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
    _log_('Done')
  })
})


function _log_ (log) {
  let d = new Date()
  let date = d.getDate()
  fs.appendFile(__dirname + '/logs/' + date + '.txt', d.toTimeString() + ': ' + log + '\n', (err) => {
    if (err) { _log_(err); throw err }
  })

  // // delete old
  // // TODO: need optomization
  // if (date - 7 < 1) date += 30
  // fs.writeFile(__dirname + '/logs/' + (date - 7) + '.txt', '', (err) => {
  //   if (err) { _log_(err); throw err }
  // })
  // fs.unlink(__dirname + '/logs/' + (date - 7) + '.txt', (err) => {
  //   if (err) { _log_(err); throw err }
  // })
}
