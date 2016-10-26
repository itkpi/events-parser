const request = require("sync-request")
const cheerio = require("cheerio")

const ain = {}
module.exports = ain

const nowYear = new Date().getFullYear()
const nowMonth = new Date().getMonth() + 1
let nextMonth = nowMonth + 1
let nextYear = nowYear
if (nextMonth === 13) { 
	nextMonth = 1
	nextYear += 1
}

ain.address = [
	['ain', `${nowYear}-${nowMonth}`, `http://ain.ua/events/${nowYear}-${nowMonth}`],
	['ain', `${nextYear}-${nextMonth}`, `http://ain.ua/events/${nextYear}-${nextMonth}`]
]

ain.get = (srcLink, srcName) => {

	let events = []

	//getting event links list
	let links = []
	let linkPos = 1

	let res = request('GET', srcLink)
	let month = cheerio.load(res.getBody().toString())

	while (true) {
		let link = ''
		link += month('.date-items').find('a').eq(linkPos).attr('href')
		if (link === 'undefined') break

		if (link.slice(21, 25) != '2016') {
			links.push(link)	
		}
		linkPos++
	}

	//adding each event into events []
	for (let i = 0; i < links.length; i++) {

		let event = {
			link: links[i],
			name:    '',
			date:    '',
			regUrl: '',
			place:   '',
			agenda:  '',
			imgUrl: ''
		}

		let res = request('GET', links[i])
		res = cheerio.load(res.getBody().toString())

		//getting event place
		let place = res('div.ven').next().text()
		let address = res('.address-marker').text() + ' '

		//убрать если не надо 
		if (place !== 'Онлайн' && address.slice(9, 13) !== ('Киев' || 'Київ')) continue 

		event.place += address.slice(16) + place

		//getting event name + price 
		let price = res('.event-head').find('a').parent().next().text().replace(/[^A-Za-z0-9.-:/$ ]/g, "").replace(/\n/g, ' ')
		event.name += res('h1').eq(1).text() + '| ₴' + price

		//getting event date
		let time = ''
		if (res('.event-head').find('time').eq(1).attr('datetime')) {
			time += res('.event-head').find('time').eq(1).attr('datetime').replace(/(<span>|<\/span>)/g, '')
		}
		event.date += srcName + '-' + res('.event-head').find('time').eq(0).attr('datetime').replace(/[^0-9.-:/$]/g, "") + 'T' + time

		//getting event regLink
		event.regUrl += res('.event-head').find('a').attr('href')

		//getting event agenda
		event.agenda += res('.txt').html()

		//getting event image
		event.imgUrl += res('.txt').find('img').attr('src')
		if (!event.imgUrl) event.imgUrl = ''

		events.push(event)
	}

	return JSON.stringify(events)
}