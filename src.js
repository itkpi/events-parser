'use strict'

const src = {}
module.exports = src

/**
 * src.address:           NUEsrcType - type of src. xml or JSON. !!!NOT USE EVAL()!!!
 * dataIO.read:           allEvents - path to JSON, only with events.
 * dataIO.eventsPosition: NUEeventId - path to unique event id. !!!NOT USE EVAL()!!!
 * dataIO.link:           NUEsrcLink - path to URL of event in source. !!!NOT USE EVAL()!!!
 * dataIO.data:           eventData - get event description from source or external API.
 * parse.title:           title - path to event title or code to extract it.
 * parse.agenda:          agenda - path to event agenda or code to extract it.
 * parse.social:          addInfo - generate additional (technical) info about event for event-moderator.
 * parse.place:           place - path to event place or code to extract it.
 * parse.regUrl:          registration - path to registration url or code to extract it.
 * parse.imgUrl:          image - path to event image or code to extract it.
 * parse.date:            dateStart - path to date when event start or code to extract it.
 * parse.date:            dateEnd - path to date when event end or code to extract it.
 * parse.time:            timeStart - path to time when event start or code to extract it.
 * parse.time:            timeEnd - path to time when event end or code to extract it.
 */
src.config = {
  dou: {
    NUEsrcType: 'xml',
    allEvents: 'data.rss.channel.item',
    NUEeventId: 'link',
    NUEsrcLink: 'link',
    eventData: 'JSON.stringify(data)',
    title: 'JSON.parse(src).title.replace(/(,)\\s[0-9]{1,2}(.)+/g, \'\')',
    agenda: 'JSON.parse(src).description.replace(/.+?(Место|Місце|Place):<\\/strong>.+?<\\/p>(.+)<\\/div>/, \'$2\')',
    addInfo: '`<a href="${link}">ORIGINAL POST</a> | \
<a href="https://www.google.com.ua/searchbyimage?newwindow=1&site=search\
&image_url=${src.replace(/.+?<img src="(.+?)"\\sstyle.+/, "$1")}" \
target="_blank">SEARCH IMAGE</a><br/>${title}<br/>${agenda}`',
    place: 'src.replace(/.+?(Место|Місце|Place):<\\/strong>\\s(.+?)<\\/p>.+/, \'$2\')',
    registration: '\'http://ITKPI.PP.UA/\'',
    image: '\'\'',
    price: '',
    dateStart: 'dateFromDOU(src)',
    dateEnd: 'dateFromDOU(src)',
    timeStart: 'src.replace(/.+?(Начало|Время|Time|Start|Час|Початок):<\\/strong>\\s(\\d{2}:\\d{2}).+/, \'$2\')',
    timeEnd: 'src.replace(/.+?(Начало|Время|Time|Start|Час|Початок):<\\/strong>\\s(\\d{2}:\\d{2}).+/, \'$2\')'
  },

  meetup: {
    NUEsrcType: 'json',
    allEvents: 'data.results',
    NUEeventId: 'name',
    NUEsrcLink: 'event_url',
    eventData: 'JSON.stringify(data)',
    title: 'JSON.parse(src).name',
    agenda: 'JSON.parse(src).description',
    addInfo: '`<a href="${link}">ORIGINAL POST</a> | <br/>${title}<br/>${agenda}`',
    place: '`${JSON.parse(src).venue.address_1} (${JSON.parse(src).venue.name})`',
    registration: 'JSON.parse(src).event_url',
    image: '\'\'',
    price: '',
    dateStart: 'dateFromMilliseconds(src, \'time\')',
    dateEnd: 'dateFromMilliseconds(src, \'time\')',
    timeStart: 'timeFromMilliseconds(src, \'time\')',
    timeEnd: 'timeFromMilliseconds(src, \'time\')'
  },

  bigCityEvent: {
    NUEsrcType: 'json',
    allEvents: 'data',
    NUEeventId: '_id',
    NUEsrcLink: '_id',
    eventData: 'request(\'GET\',`http://bigcityevent.com/api/v1/event/${data._id}`).getBody().toString()',
    title: 'JSON.parse(src).name',
    agenda: 'JSON.parse(src).description',
    addInfo: '`<a href="${link}">ORIGINAL POST</a> | <br/>${title}<br/>${agenda}`',
    place: '`${JSON.parse(src).place.location.city}, ${JSON.parse(src).place.location.street}`',
    registration: 'JSON.parse(src).link',
    image: '\'\'',
    price: '',
    dateStart: 'dateFromMilliseconds(src, \'eventTimestamp\')',
    dateEnd: 'dateFromMilliseconds(src, \'eventTimestamp\')',
    timeStart: 'timeFromMilliseconds(src, \'eventTimestamp\', 1000)',
    timeEnd: 'timeFromMilliseconds(src, \'eventTimestamp\', 1000)'
  },

  fb: {
    NUEsrcType: 'json',
    allEvents: 'data.data',
    NUEeventId: 'id',
    NUEsrcLink: 'id',
    eventData: 'JSON.stringify(data)',
    title: 'JSON.parse(src).name',
    agenda: 'JSON.parse(src).description',
    addInfo: '`<a href="${link}">ORIGINAL POST</a> | <br/>${title}<br/>${agenda}`',
             // First value can be rudiment: BigCityEvent work only in Kyiv
    place: '`${JSON.parse(src).place.location.city}, ${JSON.parse(src).place.location.street}`',
    registration: '`https://fb.com/${JSON.parse(src).id}`',
    image: '\'\'',
    price: '',
    dateStart: 'dateFromMilliseconds(src, \'start_time\')',
    dateEnd: 'dateFromMilliseconds(src, \'end_time\')',
    timeStart: 'timeFromMilliseconds(src, \'start_time\')',
    timeEnd: 'timeFromMilliseconds(src, \'end_time\')'
  },

  ain: {
    NUEsrcType: 'json',
    allEvents: 'data', 
    NUEeventId: 'link', 
    NUEsrcLink: 'link',
    eventData: `ainGetData(data)`,
    title: 'ainTitle(src)',
    agenda: `src('.txt').html()`,
    addInfo: '`<a href="${link}">ORIGINAL POST</a> | <br/>${title}<br/>${agenda}`',
    place: 'ainPlace(src)',
    registration: `src('.event-head').find('a').attr('href')`,
    image: `src('.txt').find('img').attr('src') || ''`,
    price: 'ainPrice(src)',
    dateStart: "ainDate(src)",
    dateEnd: "ainDate(src)",
    timeStart: "ainTime(src)",
    timeEnd: "ainTime(src)"
  }
}
