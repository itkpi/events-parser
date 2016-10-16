'use strict'

const src = {}
module.exports = src

const priceTo = 200

src.types = {
  dou: 'xml',
  meetup: 'json',
  bigCityEvent: 'json'
}

src.address = [
  // srcFrom, srcName, srcLink
  ['dou', 'online', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/online'],
  ['dou', 'kyiv', 'http://dou.ua/calendar/feed/%D0%B2%D1%81%D0%B5%20%D1%82%D0%B5%D0%BC%D1%8B/%D0%9A%D0%B8%D0%B5%D0%B2'],
  ['meetup', 'open_events', process.env.MEETUP_OPEN_EVENTS],
  ['bigCityEvent', 'VOLUNTEERING', 'http://bigcityevent.com/api/v1/events/?tag=VOLUNTEERING'],
  ['bigCityEvent', 'CONFERENCE_EVENT', 'http://bigcityevent.com/api/v1/events/?tag=CONFERENCE_EVENT'],
  ['bigCityEvent', 'MEETUP', `http://bigcityevent.com/api/v1/events/?tag=MEETUP&priceTo=${priceTo}`],
  ['bigCityEvent', 'WORKSHOP', `http://bigcityevent.com/api/v1/events/?tag=WORKSHOP&priceTo=${priceTo}`]
]
