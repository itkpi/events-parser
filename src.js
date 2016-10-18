'use strict'

const src = {}
module.exports = src

const priceTo = 200

src.types = {
  dou: 'xml',
  meetup: 'json',
  bigCityEvent: 'json',
  fb: 'json'
}

src.address = [
  // srcFrom, srcName, srcLink
  ['dou', 'ONLINE', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/online'],
  ['dou', 'KYIV', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/%D0%9A%D0%B8%D0%B5%D0%B2'],
  ['meetup', 'OPEN_EVENTS', process.env.MEETUP_OPEN_EVENTS],
  ['bigCityEvent', 'VOLUNTEERING', 'http://bigcityevent.com/api/v1/events/?tag=VOLUNTEERING'],
  ['bigCityEvent', 'CONFERENCE_EVENT', 'http://bigcityevent.com/api/v1/events/?tag=CONFERENCE_EVENT'],
  ['bigCityEvent', 'MEETUP', `http://bigcityevent.com/api/v1/events/?tag=MEETUP&priceTo=${priceTo}`],
  ['bigCityEvent', 'WORKSHOP', `http://bigcityevent.com/api/v1/events/?tag=WORKSHOP&priceTo=${priceTo}`],
  ['fb', 'PROJECTOR', `https://graph.facebook.com/prjctrcomua/events?access_token=${process.env.FB_ACCESS_TOKEN}`],
  ['fb', 'HUB.4.0', `https://graph.facebook.com/HUB.4.0/events?access_token=${process.env.FB_ACCESS_TOKEN}`],
  ['fb', 'MS', `https://graph.facebook.com/ITproCommunity/events?access_token=${process.env.FB_ACCESS_TOKEN}`],
  ['fb', 'ЧИТАЛКА', `https://graph.facebook.com/cybcoworking/events?access_token=${process.env.FB_ACCESS_TOKEN}`]
]
