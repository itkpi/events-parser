'use strict'

const assert = require('assert')
const transform = require('../../data/transform.js')
const _log_ = require('../../utils.js')._log_

/**
 * assertData - function for simplyfy add new test examples
 * @param {string} method - method from transform.js, what tested
 * @param {string} newData - string with data, what you want to get after transforms
 * @param {Array} rawDataArray - array of objects, with data for transform
 * @returns {boolean} true or crash on test
 */

function assertData (method, needData, rawDataArray) {
  const start = new Date()

  rawDataArray.forEach((rawData) => {
    const transData = transform[method](rawData.data)
    assert.strictEqual(needData, transData, `
method: transform.${method}
test: ${rawData.name}
expect:
${needData}

get:
${transData}

raw:
${rawData.data}
`)
  })

  const secWork = (new Date() - start) / 1000
  _log_(`transform.${method} passed all ${rawDataArray.length} tests by ${secWork}s`)

  return true
}

const titleOK = 'Automated testing in DevOps'
const titleRaw = [{
  name: 'Remove words "free" and "webinar" [1]',
  data: 'Бесплатный вебиНар Automated testing in DevOps'
}, {
  name: 'Remove words "free" and "webinar" [2]',
  data: 'Automated вебіНаро testing безКоштовне in DevOps'
}, {
  name: 'Remove words "free" and "webinar" [3]',
  data: 'webinars webinar Automated testing in DevOps free'
}, {
  name: 'Remove quotation mark',
  data: '“Automated »testing in" ”DevOps’“”"«»‘„“'
}, {
  name: 'Remove useless spaces',
  data: ' Automated   testing   in  DevOps  '
}, {
  name: 'Remove dots in the end [1]',
  data: 'Automated testing in DevOps..........'
}, {
  name: 'Remove dots in the end [2]',
  data: 'Automated testing in DevOps...вебіНаро.......'
}, {
  name: 'Combo',
  data: 'Бесплатный webinars    вебиНар"« “Automated testing безКоштовно in вебинаРНО DevOps..”   free"„“    '
}]

const agendaOK = '<p>Давно хотели узнать о суровых буднях продакт-менеджера? <br>Или просто узнать побольше о том, что это за зверь такой — продакт-менеджер?<br>Тогда этот вебинар для вас.</p><br><br><b><br>О вебинаре</b><br><br><br><ul><li>Как и откуда появилась позиция продакт-менеджер</li><li>Что это, собственно, такое — управление продуктом </li><li>С кем взаимодействует продакт-менеджер в работе: tech &amp; business. Специфика общения с различными стейкхолдерами</li></ul><br><br><p><strong>Продолжительность:</strong> <nobr>40-60</nobr> минут</p><br><br><p><strong>Регистрация:</strong> <a href="https://goo.gl/forms/" target="_blank">goo.gl/forms/EsUoO6fM5lXiiHIJ2</a> </p><br><br><p>Если у вас есть вопросы, можете написать мне на <a href="mailto:disco@prod.com">disco@prod.com</a> или отправить сообщение на <a href="https://www.linkedin.com/" target="_blank">LinkedIn</a>.</p><hr>'
const agendaRaw = [{
  name: 'Remove words "free"',
  data: '<p>Давно хотели узнать о суровых буднях продакт-менеджера? <br>Или просто узнать побольше о том, что это за зверь fREE такой — продакт-менеджер?<br>Тогда этот вебинар для вас.</p><br><br><b><br>О вебинаре</b><br><br><br><ul><li>Как и откуда появилась позиция продакт-менеджер</li><li>Что это, собственно, такое — управление продуктом </li><li>С кем взаимодействует продакт-менеджер в работе: tech &amp; бесплатнООо business. Специфика безкоштовно общения с различными стейкхолдерами</li></ul><br><br><p><strong>Продолжительность:</strong> <nobr>40-60</nobr> минут</p><br><br><p><strong>Регистрация:</strong> <a href="https://goo.gl/forms/" target="_blank">goo.gl/forms/EsUoO6fM5lXiiHIJ2</a> </p><br><br><p>Если у вас есть вопросы, можете написать мне на <a href="mailto:disco@prod.com">disco@prod.com</a> или отправить сообщение на <a href="https://www.linkedin.com/" target="_blank">LinkedIn</a>.</p><hr>'
}, {
  name: 'Remove images',
  data: '<p>Давно хотели узнать о суровых буднях продакт-менеджера? <br>Или просто узнать побольше о том, что это за зверь такой — продакт-менеджер?<br>Тогда этот вебинар для вас.</p><br><br><b><br>О вебинаре</b><br><br><br><ul><li>Как и откуда появилась позиция продакт-менеджер</li><li>Что это, собственно, такое — управление продуктом </li><li>С кем взаимодействует продакт-менеджер в работе: tech &amp; business. Специфика общения с различными стейкхолдерами</li></ul><br><br><p><strong>Продолжительность:</strong> <nobr>40-60</nobr> минут</p><br><br><p><strong>Регистрация:</strong> <a href="https://goo.gl/forms/" target="_blank">goo.gl/forms/EsUoO6fM5lXiiHIJ2</a> </p><br><br><p>Если у вас есть вопросы, можете написать мне на <a href="mailto:disco@prod.com">disco@prod.com</a> или отправить сообщение на <a href="https://www.linkedin.com/" target="_blank">LinkedIn</a>.</p><hr>'
}, {
  name: 'Replace Header-text to Bold-text',
  data: '<p>Давно хотели узнать о суровых буднях продакт-менеджера? <br>Или просто узнать побольше о том, что это за зверь такой — продакт-менеджер?<br>Тогда этот вебинар для вас.</p><br><br><h4>О вебинаре</h4><br><br><ul><li>Как и откуда появилась позиция продакт-менеджер</li><li>Что это, собственно, такое — управление продуктом </li><li>С кем взаимодействует продакт-менеджер в работе: tech &amp; business. Специфика общения с различными стейкхолдерами</li></ul><br><br><p><strong>Продолжительность:</strong> <nobr>40-60</nobr> минут</p><br><br><p><strong>Регистрация:</strong> <a href="https://goo.gl/forms/" target="_blank">goo.gl/forms/EsUoO6fM5lXiiHIJ2</a> </p><br><br><p>Если у вас есть вопросы, можете написать мне на <a href="mailto:disco@prod.com">disco@prod.com</a> или отправить сообщение на <a href="https://www.linkedin.com/" target="_blank">LinkedIn</a>.</p><hr>'
}, {
  name: 'Remove iframes',
  data: '<p>Давно хотели узнать о суровых буднях продакт-менеджера? <br>Или просто узнать побольше о том, что это за зверь такой — продакт-менеджер?<br>Тогда этот вебинар для вас.</p><br><br><b><br>О вебинаре</b><br><br><br><ul><li>Как и откуда появилась позиция продакт-менеджер</li><li>Что это, собственно, такое — управление продуктом </li><li>С кем взаимодействует продакт-менеджер в работе: tech &amp; business. Специфика общения с различными стейкхолдерами</li></ul><br><br><p><iframe wepfkpowfekpwekfpok pooqwkdfpwqkp iframe></p><p><strong>Продолжительность:</strong> <nobr>40-60</nobr> минут</p><br><br><p><strong>Регистрация:</strong> <a href="https://goo.gl/forms/" target="_blank">goo.gl/forms/EsUoO6fM5lXiiHIJ2</a> </p><br><br><p>Если у вас есть вопросы, можете<iframe iframe> написать мне на <a href="mailto:disco@prod.com">disco@prod.com</a> или отправить сообщение на <a href="https://www.linkedin.com/" target="_blank">LinkedIn</a>.</p><hr>'
}, {
  name: 'Replace spans to paragraph',
  data: '<span>Давно хотели узнать о суровых буднях продакт-менеджера? <br>Или просто узнать побольше о том, что это за зверь такой — продакт-менеджер?<br>Тогда этот вебинар для вас.</span><br><br><b><br>О вебинаре</b><br><br><br><ul><li>Как и откуда появилась позиция продакт-менеджер</li><li>Что это, собственно, такое — управление продуктом </li><li>С кем взаимодействует продакт-менеджер в работе: tech &amp; business. Специфика общения с различными стейкхолдерами</li></ul><br><br><p><strong>Продолжительность:</strong> <nobr>40-60</nobr> минут</p><br><br><p><strong>Регистрация:</strong> <a href="https://goo.gl/forms/" target="_blank">goo.gl/forms/EsUoO6fM5lXiiHIJ2</a> </p><br><br><p>Если у вас есть вопросы, можете написать мне на <a href="mailto:disco@prod.com">disco@prod.com</a> или отправить сообщение на <a href="https://www.linkedin.com/" target="_blank">LinkedIn</a>.</p><hr>'
}, {
  name: 'Replace \\n to <br>',
  data: `<p>Давно хотели узнать о суровых буднях продакт-менеджера? <br>Или просто узнать побольше о том, что это за зверь такой — продакт-менеджер?<br>Тогда этот вебинар для вас.</p>

<b><br>О вебинаре</b><br>

<ul><li>Как и откуда появилась позиция продакт-менеджер</li><li>Что это, собственно, такое — управление продуктом </li><li>С кем взаимодействует продакт-менеджер в работе: tech &amp; business. Специфика общения с различными стейкхолдерами</li></ul>

<p><strong>Продолжительность:</strong> <nobr>40-60</nobr> минут</p>

<p><strong>Регистрация:</strong> <a href="https://goo.gl/forms/" target="_blank">goo.gl/forms/EsUoO6fM5lXiiHIJ2</a> </p>

<p>Если у вас есть вопросы, можете написать мне на <a href="mailto:disco@prod.com">disco@prod.com</a> или отправить сообщение на <a href="https://www.linkedin.com/" target="_blank">LinkedIn</a>.</p><hr>`
}, {
  name: 'Replace paragraph with custom line to horizontal rule',
  data: '<p>Давно хотели узнать о суровых буднях продакт-менеджера? <br>Или просто узнать побольше о том, что это за зверь такой — продакт-менеджер?<br>Тогда этот вебинар для вас.</p><br><br><b><br>О вебинаре</b><br><br><br><ul><li>Как и откуда появилась позиция продакт-менеджер</li><li>Что это, собственно, такое — управление продуктом </li><li>С кем взаимодействует продакт-менеджер в работе: tech &amp; business. Специфика общения с различными стейкхолдерами</li></ul><br><br><p><strong>Продолжительность:</strong> <nobr>40-60</nobr> минут</p><br><br><p><strong>Регистрация:</strong> <a href="https://goo.gl/forms/" target="_blank">goo.gl/forms/EsUoO6fM5lXiiHIJ2</a> </p><br><br><p>Если у вас есть вопросы, можете написать мне на <a href="mailto:disco@prod.com">disco@prod.com</a> или отправить сообщение на <a href="https://www.linkedin.com/" target="_blank">LinkedIn</a>.</p><p>———</p>'
}, {
  name: 'Replace custom unordered lists to html',
  data: '<span>Давно хотели узнать о суровых буднях продакт-менеджера? <br>Или просто узнать побольше о том, что это за зверь такой — продакт-менеджер?<br>Тогда этот вебинар для вас.</span><br><br><b><br>О вебинаре</b><br><br><br><p>— Как и откуда появилась позиция продакт-менеджер<br>— Что это, собственно, такое — управление продуктом <br>— С кем взаимодействует продакт-менеджер в работе: tech &amp; business. Специфика <iframe sdfsfsdf iframe>общения с различными стейкхолдерами.</p><br><br><p><strong>Продолжительность:</strong> <nobr>40-60</nobr> минут</p><br><br><p><strong>Регистрация:</strong> <a href="https://goo.gl/forms/" target="_blank">goo.gl/forms/EsUoO6fM5lXiiHIJ2</a> </p><br><br><p>Если у вас есть вопросы, можете написать мне на <a href="mailto:disco@prod.com">disco@prod.com</a> или отправить сообщение на <a href="https://www.linkedin.com/" target="_blank">LinkedIn</a>.</p><hr>'
}, {
  name: 'Combo',
  data: `<p>Давно хотели узнать о суровых буднях продакт-менеджера? <br>Или просто узнать побольше о том, что это за зверь такой — продакт-менеджер?<br>Тогда этот вебинар для вас.</p>

<h4>О вебинаре</h4>

<p>— Как и откуда появилась позиция продакт-менеджер<br>— Что это, собственно, такое — управление продуктом <br>— С кем взаимодействует продакт-менеджер в работе: tech &amp; business. Специфика общения с различными стейкхолдерами.</p>

<p><strong>Продолжительность:</strong> <nobr>40-60</nobr> минут</p>

<p><strong>Регистрация:</strong> <a href="https://goo.gl/forms/" target="_blank">goo.gl/forms/EsUoO6fM5lXiiHIJ2</a> </p>

<p>Если у вас есть вопросы, можете написать мне на <a href="mailto:disco@prod.com">disco@prod.com</a> или отправить сообщение на <a href="https://www.linkedin.com/" target="_blank">LinkedIn</a>.</p><p>———</p>`
}]

const addInfoOK = `<a href="https://dou.ua/calendar/">ORIGINAL POST</a> | <a href="https://www.google.com.ua/searchbyimage?newwindow=1&site=search&image_url="https://s.dou.ua/371.png" target="_blank">SEARCH IMAGE</a><br/>Вебинар: Ни кнута, ни пряника. Чем и как управляет продакт-менеджер<br/><div><p><a href="https://dou.ua/calendar/" target="_blank"><img width="600" src="https://s.dou.ua/371.png"><br/>https://s.dou.ua/371.png<br/></a><strong>Дата:</strong> 10 ноября (четверг)<br><strong>Начало:</strong> 19:00<br><strong>Место:</strong> Online</p>

<p>Давно хотели узнать о суровых буднях продакт-менеджера? <br>Или просто узнать побольше о том, что это за зверь такой — продакт-менеджер?<br>Тогда этот вебинар для вас.</p>

<h4>О вебинаре</h4>

<p>— Как и откуда появилась позиция продакт-менеджер<br>— Что это, собственно, такое — управление продуктом <br>— С кем взаимодействует продакт-менеджер в работе: tech &amp; business. Специфика общения с различными стейкхолдерами.</p>

<p><strong>Продолжительность:</strong> <nobr>40-60</nobr> минут</p>

<p><strong>Регистрация:</strong> <a href="https://goo.gl/forms/" target="_blank">goo.gl/forms/EsUoO6fM5lXiiHIJ2</a> </p>

<p>Если у вас есть вопросы, можете написать мне на <a href="mailto:disco@prod.com">disco@prod.com</a> или отправить сообщение на <a href="https://www.linkedin.com/" target="_blank">LinkedIn</a>.</p></div>`
const addInfoRaw = [{
  name: 'Combo',
  data: `<a href="https://dou.ua/calendar/">ORIGINAL POST</a> | <a href="https://www.google.com.ua/searchbyimage?newwindow=1&site=search&image_url="https://s.dou.ua/371.png" target="_blank">SEARCH IMAGE</a><br/>Вебинар: Ни кнута, ни пряника. Чем и как управляет продакт-менеджер<br/><div><p><a href="https://dou.ua/calendar/" target="_blank"><img src="https://s.dou.ua/371.png" style="float: right; padding-left: 4px;"></a><strong>Дата:</strong> 10 ноября (четверг)<br><strong>Начало:</strong> 19:00<br><strong>Место:</strong> Online</p>

<p>Давно хотели узнать о суровых буднях продакт-менеджера? <br>Или просто узнать побольше о том, что это за зверь такой — продакт-менеджер?<br>Тогда этот вебинар для вас.</p>

<h4>О вебинаре</h4>

<p>— Как и откуда появилась позиция продакт-менеджер<br>— Что это, собственно, такое — управление продуктом <br>— С кем взаимодействует продакт-менеджер в работе: tech &amp; business. Специфика общения с различными стейкхолдерами.</p>

<p><strong>Продолжительность:</strong> <nobr>40-60</nobr> минут</p>

<p><strong>Регистрация:</strong> <a href="https://goo.gl/forms/" target="_blank">goo.gl/forms/EsUoO6fM5lXiiHIJ2</a> </p>

<p>Если у вас есть вопросы, можете написать мне на <a href="mailto:disco@prod.com">disco@prod.com</a> или отправить сообщение на <a href="https://www.linkedin.com/" target="_blank">LinkedIn</a>.</p></div>`
}]

assertData('title', titleOK, titleRaw)
assertData('agenda', agendaOK, agendaRaw)
assertData('addInfo', addInfoOK, addInfoRaw)
