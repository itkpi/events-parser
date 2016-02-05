const fs = require('fs')
const xml2json = require('xml2json')
const querystring = require('querystring')
const http = require('http')

/**
 * Save old file DISABLE FOR TESTS
 */
// fs.readFile(__dirname + '/new_data.json', (err, data) => {
//   if (err) throw err

//   fs.writeFile(__dirname + '/old_data.json', data, (err) => {
//     if (err) throw err
//     console.log('Done: write old file')
//   })
//   console.log('Done: read old file')
// })

/**
 * XML to JSON
 */
fs.readFile(__dirname + '/test.xml', (err, data) => { // TODO: https://toster.ru/q/199773
  if (err) throw err

  var result = xml2json.toJson(data, {sanitize: false})


  fs.writeFile(__dirname + '/new_data.json', result, (err) => {
    if (err) throw err
    console.log('Done: write new file')
  })
  console.log('Done: read new file')

  /**
  * Add new event
  */
  fs.readFile(__dirname + '/new_data.json', (err, new_data) => {
    if (err) throw err

    fs.readFile(__dirname + '/old_data.json', (err, old_data) => {
      if (err) throw err

      setTimeout(null, 15000)
      var newData = JSON.parse(new_data)
      var oldData = JSON.parse(old_data)

      if (newData.rss.channel.lastBuildDate ===
          oldData.rss.channel.lastBuildDate) return console.log('UP TO DATE')

      var newI = newData.rss.channel.item
      var oldI = oldData.rss.channel.item

      var num = 0 // # останнього нового запису
      for (num; num < oldI.length; num++) {
        if (oldI[0].link === newI[num].link) {
          num -= 1
          break
        }
      }

      /**
       * Send event to EventMonkey
       */
      while (num >= 0) {
        var newID = newI[num].description

        console.log('qwerty')

        var title, agenda, place, registration_url, image_url, only_date, when_start
        switch (newData.rss.channel.link) {
          case 'http://dou.ua/calendar/':
        //     title = newI[num].title.replace(/(,)\s[0-9]{1,2}(.)+/g, '')
            agenda = newID.substring(newID.indexOf('h', 70), newID.indexOf('"', 150)) + // mini picture
                      newID.substring(newID.indexOf('p', newID.indexOf('М', 250)) + 4) // other
            place = newID.substring(newID.indexOf('М', 250) + 27, newID.indexOf('p', newID.indexOf('М', 250)) - 2)
            registration_url = ''
            image_url = ''
            only_date = false

            var month = {
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
            var today = new Date()
            var dd = newID.substring(newID.indexOf('Д', 200) + 15, newID.indexOf(' ', newID.indexOf('Д', 200) + 15))
            var mm_now = today.getMonth() + 1 // January is 0!
            var mm = month[newID.substring(newID.indexOf('Д', 200) + 17, newID.indexOf(' ', newID.indexOf('Д', 200) + 17))]
            var yyyy = today.getFullYear()
            if (dd < 10) dd = '0' + dd
            if (mm < 10) mm = '0' + mm
            if (mm_now > mm) yyyy += 1

            when_start = yyyy + '-' + mm + '-' + dd
            var time = newID.substring(newID.indexOf('Н', 250) + 17, newID.indexOf('b', newID.indexOf('Н', 250) + 17) - 1)
            if (time.length < 6) {
              when_start += ' ' + time
            } else {
              only_date = true
            }


            break
        }

          //   title: title,
          //   agenda: agenda,
          //   place:  place,
          //   registration_url: registration_url,
          //   image_url: image_url,
          //   when_start: when_start,
          // // when_end: when_start
          //   only_date: only_date,

        var body = JSON.stringify({
          title: 'test',
          agenda: '-',
          social: '-',
          place: 'Онлайн',
          registration_url: 'https://vk.com/',
          image_url: 'https://pp.vk.me/c631130/v631130008/b3a4/fgq304e9aOk.jpg',
          level: 'NONE',
          when_start: '2016-10-11 10:00',
          when_end: '2016-10-11 09:00',
          only_date: 'false',
          team: 'ITKPI',
          submitter_email: 'vm@itkpi.pp.ua'
        })

        var request = new http.ClientRequest({
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
        console.log('ololo')
      }
    })
    console.log('Done: Add new event')
  })
})
