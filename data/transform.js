/**
 * These functions are transforming the text.
 * By removing or replacing text achieved a single design style of all events.
 */

'use strict'

const transform = {}
module.exports = transform

/**
 * Title field style unification.
 * @param {string} data - title from source.
 * @returns {string} title of the event.
 */
transform.title = (data) => {
  const title = data
    // Remove words 'free' and 'webinar'
    .replace(/((бесплат|вебин|безкоштовн|вебін)[а-я]+|free|webinars?)/ig, '')
    // Remove quotation mark
    .replace(/["«»‘’“”„“]/g, '')
    // Remove useless spaces
    .trim().replace(/\s{2,}/g, ' ')
    // Remove dots in the end
    .replace(/\.+$/g, '')


  return title
}

/**
 * Agenda field style unification.
 * @param {string} data - agenda from source.
 * @returns {string} agenda of the event.
 */
transform.agenda = (data) => {
  const agenda = data
    // Remove words 'free'
    .replace(/((бесплат|безкоштовн)[а-я]+|free)\s?/ig, '')
    // Remove images
    .replace(/<img.+?">(<br>)?/g, '')
    // Replace Header-text to Bold-text
    .replace(/h[1-4]{1}(\sstyle=".{0,}")?>/g, 'b><br>')
    // Remove iframes
    .replace(/<p><iframe.{0,}iframe><\/p>|<iframe.{0,}iframe>/g, '')
    // Replace spans to paragraph
    .replace(/<span.*?>(.+?)<\/span>/g, '<p>$1</p>')
    // Replace \n to <br>
    .replace(/\n/g, '<br>')
    // Replace paragraph with custom line to horizontal rule
    .replace(/<p>—{3,}<\/p>/g, '<hr>')
    // Replace custom unordered lists to html  // TODO: Rewrite this
    .replace(/<p>([—-•●∙](?:\s|&nbsp;)?|(\d{2}.\d{2}.{1,10}\d{2}.\d{2}))(.+?)[.;\,]?<\/p>/g, '<ul><li>$2$3</li></ul>')
    .replace(/(<br>([—-•●∙](?:\s|&nbsp;)?|(\d{2}.\d{2}.{1,10}\d{2}.\d{2}))(.+?)[.;\,]?)+/g, '</li><li>$3$4')
    .replace(/(:)<\/li>(<li>.+?)(<\/p>)/g, '$1<ul>$2</li></ul>$3')

  return agenda
}

/**
 * Additional information field style unification.
 * @param {string} data - combine field with external information for moderators.
 * @returns {string} addInfo of the event.
 */
transform.addInfo = (data) => {
  const addInfo = data
    // Change image width
    .replace(/(<img)(\sstyle=".+?")?(\ssrc="(.+?)")(\sstyle=".+?")?(>)/g, '$1 width="600"$3$6<br/>$4<br/>')

  return addInfo
}

/**
 * Place field style unification.
 * @param {string} data - place from source.
 * @returns {string} place of the event.
 */
transform.place = (data) => {
  const place = data
    // Remove 'Ukraine' from the field
    .replace(/(Украина|Україна|Ukraine)(,\s)?/, '')
    // Remove 'Kyiv' from the field
    .replace(/(Киев|Київ|Kyiv|Kiev)(,\s)?/, '')
    // Remove html tags
    .replace(/(.*?)<.+?>(.+?)/g, '$1$2')

  return place
}
