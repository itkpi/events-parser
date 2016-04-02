'use strict'

const fs = require('fs-extra')
const xml2json = require('xml2json')
const http = require('http')
const request = require('sync-request')

fs.ensureDirSync(__dirname + '/logs/')

_log_('Start')

let adress = [ // xml-file name, link
  ['dou_ua_online', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/online'],
  ['dou_ua_kyiv', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/%D0%9A%D0%B8%D0%B5%D0%B2']
]

for (let adr = 0; adr < adress.length; adr++) {
  // Paths to auxiliary files
  let xml = __dirname + '/xml/' + adress[adr][0] + '.xml'
  let newJSON = __dirname + '/json/new_' + adress[adr][0] + '.json'
  let oldJSON = __dirname + '/json/old_' + adress[adr][0] + '.json'

  // Check for the existence files
  fs.ensureFileSync(xml)
  fs.ensureFileSync(newJSON)
  fs.ensureFileSync(oldJSON)

  // Get xml-data from sources
  let res = request('GET', adress[adr][1])
  fs.writeFileSync(xml, res.getBody())

  // Save old file
  fs.copySync(newJSON, oldJSON)

  // XML to JSON
  let data = fs.readFileSync(xml)
  let result = xml2json.toJson(data, {sanitize: false})
  fs.writeFileSync(newJSON, result)

  data = fs.readFileSync(oldJSON)
  if (data == '') { _log_(adress[adr][0] + ': INIT'); continue } // not rewrite to '==='

  // Add new event
  let newData = fs.readJsonSync(newJSON, {throws: false})
  let oldData = fs.readJsonSync(oldJSON, {throws: false})

  if (newData.rss.channel.item[0].title ===
      oldData.rss.channel.item[0].title) { _log_(adress[adr][0] + ': UP TO DATE'); continue }

  let newI = newData.rss.channel.item
  let oldI = oldData.rss.channel.item

  let num = 0 // # the last new entry
  for (num; num < oldI.length; num++) {
    if (oldI[0].link === newI[num].link) {
      num -= 1
      break
    }
  }

  // RSS to API
  while (num >= 0) {
    let newID = newI[num].description

    function index (foo, bar) {
      return newID.indexOf(foo, bar)
    }

    function substr (foo, bar) {
      return newID.substring(foo, bar)
    }

    let title, agenda, place, registration_url, image_url, only_date, when_start
    switch (newData.rss.channel.link) {
      case 'http://dou.ua/calendar/':
        title = newI[num].title.replace(/(,)\s[0-9]{1,2}(.)+/g, '')

        agenda = '<a href="https://www.google.com.ua/searchbyimage?newwindow=1&site=search&image_url=' + substr(index('h', 70), index('"', 150)) + '" target="_blank">IMAGE</a><br/>' + // picture
                  substr(index('p', index('М', 250)) + 4) // other
        agenda = agenda.replace(/(h4>)/g, 'b>')

        place = substr(index('М', 250) + 27, index('p', index('М', 250)) - 2)
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
        let dd = substr(index('Д', 200) + 17, index(' ', index('Д', 200))).replace(' ', '').replace(' ', '')
        let mm_now = today.getMonth() + 1 // January is 0!
        let mm = month[substr(index('Д', 200) + 17, index(' ', index('Д', 200) + 17)).replace(' ', '')] // In 'replace' - non-breaking space
        let yyyy = today.getFullYear()
        if (dd < 10) dd = '0' + dd
        if (mm_now > mm) yyyy += 1

        when_start = yyyy + '-' + mm + '-' + dd
        let time = substr(index('Н', 250) + 17, index('b', index('Н', 250) + 17) - 1)
        if (time.length < 6) {
          when_start += ' ' + time
        } else {
          only_date = true
        }

        break
    }

    // Send event to EventMonkey
    let body = JSON.stringify({
      title: '_T_E_S_T_ ' + adress[adr][0] + ' ' + title,
      agenda: agenda,
      social: '',
      place: place,
      registration_url: registration_url,
      image_url: image_url,
      level: 'NONE',
      when_start: when_start,
      when_end: when_start, // Required field... Need change in API
      only_date: only_date,
      team: 'ITKPI',
      submitter_email: 'vm@itkpi.pp.ua'
    })

    let options = {
      hostname: 'eventsmonkey.itkpi.pp.ua',
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
    num -= 1
  }
  _log_(adress[adr][0] + ': Done add all events')
}
_log_('Done \n')

var date
function _log_ (log) {
  let d = new Date()
  date = d.getDate()
  fs.appendFile(__dirname + '/logs/' + date + '.txt', d.toTimeString() + ': ' + log + '\n', (err) => {
    if (err) throw err
  })
}

if (date < 10) date += 30

remove()

function remove () {
  fs.remove(__dirname + '/logs/' + (date - 10) + '.txt', (err) => {
    if (err) throw err
  })
}
