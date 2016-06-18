'use strict'

const fs = require('fs-extra')
const http = require('http')
const yandex = require('yandex-translate')(process.env.YANDEX_TRANSLATE_KEY)

const parse = require('./parse.js')
const locale = require('./locale.js')
const _log_ = require('./log.js')._log_
const inBlackList = require('./blackList.js').inBlackList
const getData = require('./getData.js')

console.info('Start')
fs.ensureDirSync('./logs/')

let adress = [ // srcName, srcType, srcLink
  ['dou_ua_online', 'xml', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/online'],
  ['dou_ua_kyiv', 'xml', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/%D0%9A%D0%B8%D0%B5%D0%B2'],
  ['meetup_open_events', 'json', process.env.MEETUP_OPEN_EVENTS]
]

for (let adr = 0; adr < adress.length; adr++) {
  let srcName = adress[adr][0]
  console.info(`Start ${srcName}`)

  // Paths to auxiliary files
  let newJSON = `./json/new_${srcName}.json`
  let oldJSON = `./json/old_${srcName}.json`

  let getNewData = getData.get(srcName, adress[adr][1], adress[adr][2], newJSON, oldJSON)
  if (!getNewData) continue

  // Read data
  let newI = getData.read(srcName, fs.readJsonSync(newJSON, {throws: false}))
  let oldI = getData.read(srcName, fs.readJsonSync(oldJSON, {throws: false}))

  // Find new events
  let eventsPosition = getData.eventsPosition(srcName, newI, oldI)

  // RSS to API
  while (eventsPosition.length > 0) {
    let eventTitle, eventLink, newID
    switch (srcName) {
      case 'dou_ua_kyiv':
      case 'dou_ua_online':
        eventTitle = newI[eventsPosition[0]].title
        eventLink = newI[eventsPosition[0]].link
        newID = newI[eventsPosition[0]].description.replace(/[\n,\u2028]/g, '')
        break
      case 'meetup_open_events':
        eventTitle = newI[eventsPosition[0]].name
        eventLink = newI[eventsPosition[0]].event_url
        newID = JSON.stringify(newI[eventsPosition[0]])
        break
      default:
        _log_(`ERROR: NOT FOUND ${srcName} in eventLink`)
    }
    _log_(`${srcName}: ${eventLink} start\n`)

    // Parse event description
    let title = parse.title(srcName, eventTitle)
    let agenda = parse.agenda(srcName, newID)

    if (inBlackList(title, agenda, `${eventLink}\n${eventTitle}`)) {
      eventsPosition.shift()
      continue
    }

    let social = parse.social(srcName, newID, eventLink, title, agenda)
    let place = parse.place(srcName, newID)
    let regUrl = parse.regUrl(srcName, newID)
    let imgUrl = parse.imgUrl(srcName, newID)
    let whenStart = parse.whenStart(srcName, newID)
    let onlyDate = parse.time(srcName, newID)
    if (onlyDate !== true) {
      whenStart += onlyDate
      onlyDate = false
    }

    // Delete superfluous words
    title = title.replace(/(бесплат|вебин|безкоштовн|вебін)[а-я]+\s/ig, '')
                  .replace(/[",«,‘,“,„]+(.{0,})+[",»,’,”,“]/, '$1') // Quotation mark
                  .replace(/(.{0,})(\.{1,})/, '$1')
    agenda = agenda.replace(/(бесплат|безкоштовн)[а-я]+\s/ig, '')
                    .replace(/<img.+?">(<br>)?/g, '')
                    .replace(/h[1-4]{1}(\sstyle=".{0,}")?>/g, 'b><br>')
                    .replace(/<p><iframe.{0,}iframe><\/p>|<iframe.{0,}iframe>/g, '')
                    .replace(/<span.+?>(.+?)<\/span>(<br>)?/g, '<p>$1</p>')
                    .replace(/<p>—{3,}<\/p>/g, '<hr>')
      // unordered lists
      .replace(/<p>([—-•●∙](?:\s|&nbsp;)?|(\d{2}.\d{2}.{1,10}\d{2}.\d{2}))(.+?)[.;\,]?<\/p>/g, '<ul><li>$2$3</li></ul>')
      .replace(/(<br>([—-•●∙](?:\s|&nbsp;)?|(\d{2}.\d{2}.{1,10}\d{2}.\d{2}))(.+?)[.;\,]?)+/g, '</li><li>$3$4')
      .replace(/(:)<\/li>(<li>.+?)(<\/p>)/g, '$1<ul>$2</li></ul>$3')

    social = social.replace(/(<img)(\sstyle=".+?")?(\ssrc="(.+?)")(\sstyle=".+?")?(>)/g, '$1 width="623"$3$6<br/>$4<br/>')

    place = place.replace(/(Киев|Київ|Kyiv|Kiev)(,\s)?/, '')
                  .replace(/(.*?)<.+?>(.+?)/g, '$1$2')

    if (agenda.length > 14000) {
      agenda = '<h1>Too many. Do we really need this?</h1>'
    }
    let agenda2 = ''

    let ya = new Promise((resolve, reject) => { // Translate
      if (locale.lang === 'ru') {
        if (agenda.length < 14000) {
          agenda2 = agenda.replace(/(.{0,7000}\s)(.{0,})/, '$2')
          agenda = agenda.replace(/(.{0,7000}\s).{0,}/, '$1')
        }
        yandex.translate(agenda, { from: 'ru', to: 'uk' }, (err, res) => {
          if (err) throw err
          agenda = res.text
          yandex.translate(agenda2, { from: 'ru', to: 'uk' }, (err, res) => {
            if (err) throw err
            agenda += res.text
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
      } else {
        return resolve()
      }
    })

    ya.then(() => { // Send event to EventMonkey
      let body = JSON.stringify({
        title: title.toString(),
        agenda: agenda.toString(),
        social: `<i>From: ${srcName}</i> ${social.toString()}`,
        place: place.toString(),
        registration_url: regUrl,
        image_url: imgUrl,
        level: 'NONE',
        when_start: whenStart,
        when_end: whenStart, // Required field... Need change in API
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
      return Promise.resolve()
    })
    eventsPosition.shift()
  }
}
console.info('End')
