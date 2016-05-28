'use strict'

const fs = require('fs-extra')
const http = require('http')
const yandex = require('yandex-translate')(process.env.YANDEX_TRANSLATE_KEY)

const parse = require('./parse.js')
const locale = require('./locale.js')
const _log_ = require('./log.js')._log_
const inBlackList = require('./blackList.js').inBlackList
const getNewData = require('./getNewData.js').getNewData

fs.ensureDirSync('./logs/')

let adress = [ // srcName, srcType, srcLink
  ['dou_ua_online', 'xml', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/online'],
  ['dou_ua_kyiv', 'xml', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/%D0%9A%D0%B8%D0%B5%D0%B2']
]

for (let adr = 0; adr < adress.length; adr++) {
  // Paths to auxiliary files
  let newJSON = `./json/new_${adress[adr][0]}.json`
  let oldJSON = `./json/old_${adress[adr][0]}.json`

  getNewData(adress[adr][0], adress[adr][1], adress[adr][2], newJSON, oldJSON)

  // Add new event
  let newData = fs.readJsonSync(newJSON, {throws: false})
  let oldData = fs.readJsonSync(oldJSON, {throws: false})

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
    _log_(`${adress[adr][0]}: ${newI[num].link} start\n`)

    let newID = newI[num].description.replace(/[\n,\u2028]/g, '')
    let site = {
      'https://dou.ua/calendar/': 'dou.ua'
    }
    let link = site[newData.rss.channel.link]

    // Parse event description
    let title = parse.title(link, newI[num].title)
    let agenda = parse.agenda(link, newID)

    if (inBlackList(title, agenda, `${newI[num].link}\n${newI[num].title}`)) {
      num -= 1
      continue
    }

    let social = parse.social(link, newID, newI[num].link, title, agenda)
    let place = parse.place(link, newID)
    let regUrl = parse.regUrl(link, newID)
    let imgUrl = parse.imgUrl(link, newID)
    let whenStart = parse.whenStart(link, newID)
    let onlyDate = parse.time(link, newID)
    if (onlyDate !== true) {
      onlyDate = false
      whenStart += parse.time(link, newID)
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

    let agenda1 = '<h1>Too many. Do we really need this?</h1>'
    let agenda2 = ''
    if (agenda.length < 14000) {
      agenda1 = agenda.replace(/(.{0,7000}\s).{0,}/, '$1')
      agenda2 = agenda.replace(/(.{0,7000}\s)(.{0,})/, '$2')
    }

    let ya = new Promise((resolve, reject) => { // Translate
      if (locale.lang === 'ru') {
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
      } else {
        agenda1 = agenda
      }
    })

    ya.then(() => { // Send event to EventMonkey
      let body = JSON.stringify({
        title: title.toString(),
        agenda: agenda1.toString() + agenda2.toString(),
        social: '<i>From: ' + adress[adr][0] + '</i> ' + social.toString(),
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
    num -= 1
  }
}
