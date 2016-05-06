'use strict'

const fs = require('fs-extra')
const xml2json = require('xml2json')
const http = require('http')
const request = require('sync-request')
const yandex = require('yandex-translate')(process.env.YANDEX_TRANSLATE_KEY)
const moment = require('moment')

fs.ensureDirSync('./logs/')
_log_('\n')

let adress = [ // xml-file name, link
  ['dou_ua_online', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/online'],
  ['dou_ua_kyiv', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/%D0%9A%D0%B8%D0%B5%D0%B2']
]

for (let adr = 0; adr < adress.length; adr++) {
  // Paths to auxiliary files
  let xml = './xml/' + adress[adr][0] + '.xml'
  let newJSON = './json/new_' + adress[adr][0] + '.json'
  let oldJSON = './json/old_' + adress[adr][0] + '.json'

  let p = new Promise((resolve, reject) => { // Check for the existence files
    fs.ensureFile(xml, (err) => { if (err) throw err })
    fs.ensureFile(newJSON, (err) => { if (err) throw err })
    fs.ensureFile(oldJSON, (err) => { if (err) throw err })
    return resolve()
  })

  p.then(() => { // Get xml-data from sources
    let res = request('GET', adress[adr][1])
    return fs.writeFileSync(xml, res.getBody())
  })

  p.then(() => { // Save old file
    return fs.copySync(newJSON, oldJSON)
  })

  p.then(() => { // XML to JSON
    let data = fs.readFileSync(xml)
    let result = xml2json.toJson(data, {sanitize: false})
    fs.writeFileSync(newJSON, result)

    data = fs.readFileSync(oldJSON)
    if (data == '') { _log_(adress[adr][0] + ': INIT'); /*continue*/ } // not rewrite to '==='
    return Promise.resolve()
  })

  p.then(() => { // Add new event
    let newData = fs.readJsonSync(newJSON, {throws: false})
    let oldData = fs.readJsonSync(oldJSON, {throws: false})

    if (newData.rss.channel.item[0].title ===
        oldData.rss.channel.item[0].title) { _log_(adress[adr][0] + ': UP TO DATE'); /*continue*/ }

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
      _log_(adress[adr][0] + ': ' + newI[num].link + ' start')

      let newID = newI[num].description.replace(/\n/g, '')

      let title, agenda, place, registration_url, image_url, only_date, when_start, social
      switch (newData.rss.channel.link) {
        case 'http://dou.ua/calendar/':
          title = newI[num].title.replace(/(,)\s[0-9]{1,2}(.)+/g, '')

          agenda = newID.replace(/.+?Место:<\/strong>.+?<\/p>(.+)<\/div>/, '$1')

          social = '<a href="' + newI[num].link + '">ORIGINAL POST</a> | ' + // link on original post
                   '<a href="https://www.google.com.ua/searchbyimage?newwindow=1&site=search&image_url=' +
                   newID.replace(/.+?<img src="(.+?)"\sstyle.+/, '$1') + '" target="_blank">SEARCH IMAGE</a><br/>' + // picture
                   title + '<br/>' + agenda

          place = newID.replace(/.+?Место:<\/strong>\s(.+?)<\/p>.+/, '$1')
          if (place.toLowerCase() === 'online') place = 'Онлайн'

          registration_url = 'http://ITKPI.PP.UA/'
          image_url = ''
          only_date = false

          let today = new Date()
          let dd = newID.replace(/.+?Дата:<\/strong>\s(\d{1,2}).+/, '$1')
          let mm_now = today.getMonth() + 1 // January is 0!

          let mm = newID.replace(/.+?Дата:<\/strong>\s\d{1,2}(\s—\s\d{1,2})?\s([а-я,a-z,A-Z,А-Я]+).+/, '$2')

          moment.locale('ru')
          if (!isNaN(moment(mm, 'MMMM').get('month'))) {
            mm = moment(mm, 'MMMM').get('month') + 1
          } else {
            moment.locale('uk')
            if (!isNaN(moment(mm, 'MMMM').get('month'))) {
              mm = moment(mm, 'MMMM').get('month') + 1
            } else {
              moment.locale('en')
              mm = moment(mm, 'MMMM').get('month') + 1
            }
          }

          let yyyy = today.getFullYear()
          if (mm_now > mm) yyyy += 1

          when_start = yyyy + '-' + mm + '-' + dd
          let time = newID.replace(/.+?Начало:<\/strong>\s(\d{2}:\d{2}).+/, '$1')
          if (time.length < 6) {
            when_start += ' ' + time
          } else {
            only_date = true
          }

          break
      }

      // Delete superfluous words
      title = title.replace(/(бесплат|вебин|безкоштовн|вебін)[а-я]+\s/ig, '')
                   .replace(/[",«,‘,“,„]+(.{0,})+[",»,’,”,“]/, '$1') // Quotation mark
                   .replace(/(.{0,})(\.{1,})/, '$1')
      agenda = agenda.replace(/(бесплат|безкоштовн)[а-я]+\s/ig, '')
                     .replace(/<img.+?">(<br>)?/g, '')
                     .replace(/h[1-4]{1}(\sstyle=".{0,}")?>/g, 'b><br>')
                     .replace(/<p><iframe.{0,}iframe><\/p>|<iframe.{0,}iframe>/g, '')

                     // unordered lists
                     .replace(/<p>([—,-,•,●](?:\s|&nbsp;)?|(\d{2}.\d{2}.{1,10}\d{2}.\d{2}))(.+?)[.,;,\,]?<\/p>/g, '<ul><li>$2$3</li></ul>')
                     .replace(/(<br>([—,-,•,●](?:\s|&nbsp;)?|(\d{2}.\d{2}.{1,10}\d{2}.\d{2}))(.+?)[.,;,\,]?)+/g, '</li><li>$3$4')
                     .replace(/(:)<\/li>(<li>.+?)(<\/p>)/g, '$1<ul>$2</li></ul>$3')

      social = social.replace(/(<img)(\sstyle=".{0,50}")?(\ssrc="(.{0,200})")(\sstyle=".{0,50}")?(>)/g, '$1 width="623"$3$6<br/>$4<br/>')
      place = place.replace(/(Киев|Київ|Kyiv|Kiev)(,\s)?/, '')
      let agenda1 = '<h1>Too many. Do we really need this?</h1>'
      let agenda2 = ''
      if (agenda.length < 14000) {
        agenda1 = agenda.replace(/(.{0,7000}\s).{0,}/, '$1')
        agenda2 = agenda.replace(/(.{0,7000}\s)(.{0,})/, '$2')
      }

      let ya = new Promise((resolve, reject) => { // Translate

        yandex.translate(agenda1, { from: 'ru', to: 'uk' }, (err, res) => {
          if (err) throw err
          agenda1 = res.text
          yandex.translate(agenda2, { from: 'ru', to: 'uk' }, (err, res) => {
            if (err) throw err
            agenda2 = res.text
            yandex.translate(title, { from: 'ru', to: 'uk' }, (err, res) => {
              if (err) throw err
              title = res.text
              yandex.translate(place, { from: 'ru', to: 'uk' }, (err, res) => {
                if (err) throw err
                place = res.text
                return resolve()
              })
            })
          })
        })
      })

      ya.then(() => { // Send event to EventMonkey
        let body = JSON.stringify({
          title: title.toString(),
          agenda: agenda1.toString() + agenda2.toString(),
          social: '<i>From: ' + adress[adr][0] + '</i> ' + social.toString(),
          place: place.toString(),
          registration_url: registration_url,
          image_url: image_url,
          level: 'NONE',
          when_start: when_start,
          when_end: when_start, // Required field... Need change in API
          only_date: only_date,
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
        return Promise.resolve()
      })
      num -= 1
      _log_(adress[adr][0] + ': ' + newI[num].link + ' end')
    }
    return ya.resolve()
  })
}

var date
function _log_ (log) {
  let d = new Date()
  date = d.getDate()
  fs.appendFile('./logs/' + date, d.toTimeString() + ': ' + log + '\n', (err) => {
    if (err) throw err
  })
}

if (date < 10) date += 30

remove()

function remove () {
  fs.remove('./logs/' + (date - 10) + '.txt', (err) => {
    if (err) throw err
  })
}
