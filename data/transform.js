/**
 * These functions are transforming the text.
 * By removing or replacing text achieved a single design style of all events.
 */

'use strict'

/**
 * @returns {string}
 */
exports.title = (data) => {
  const title = data
    // Remove words 'free' and 'webinar'
    .replace(/(бесплат|вебин|безкоштовн|вебін)[а-я]+\s/ig, '')
    // Remove quotation mark
    .replace(/[",«,‘,“,„]+(.{0,})+[",»,’,”,“]/, '$1')
    // Remove dots in the end
    .replace(/(.{0,})(\.{1,})/, '$1')

  return title
}

/**
 * @returns {string}
 */
exports.agenda = (data) => {
  const agenda = data
    // Remove word 'free'
    .replace(/(бесплат|безкоштовн)[а-я]+\s/ig, '')
    // Remove images
    .replace(/<img.+?">(<br>)?/g, '')
    // Replace Header-text to Bold-text
    .replace(/h[1-4]{1}(\sstyle=".{0,}")?>/g, 'b><br>')
    // Remove iframes
    .replace(/<p><iframe.{0,}iframe><\/p>|<iframe.{0,}iframe>/g, '')
    // Replace spans to paragraph
    .replace(/<span.+?>(.+?)<\/span>(<br>)?/g, '<p>$1</p>')
    // Replace paragraph with custom line to horizontal rule
    .replace(/<p>—{3,}<\/p>/g, '<hr>')
    // Replace custom unordered lists to html  // TODO: Rewrite this
    .replace(/<p>([—-•●∙](?:\s|&nbsp;)?|(\d{2}.\d{2}.{1,10}\d{2}.\d{2}))(.+?)[.;\,]?<\/p>/g, '<ul><li>$2$3</li></ul>')
    .replace(/(<br>([—-•●∙](?:\s|&nbsp;)?|(\d{2}.\d{2}.{1,10}\d{2}.\d{2}))(.+?)[.;\,]?)+/g, '</li><li>$3$4')
    .replace(/(:)<\/li>(<li>.+?)(<\/p>)/g, '$1<ul>$2</li></ul>$3')

  return agenda
}

/**
 * @returns {string}
 */
exports.social = (data) => {
  const social = data
    // Change image width
    .replace(/(<img)(\sstyle=".+?")?(\ssrc="(.+?)")(\sstyle=".+?")?(>)/g, '$1 width="623"$3$6<br/>$4<br/>')

  return social
}

/**
 * @returns {string}
 */
exports.place = (data) => {
  const place = data
    // Remove 'Kyiv' from the field
    .replace(/(Киев|Київ|Kyiv|Kiev)(,\s)?/, '')
    // Remove html tags // FIX ME: It looks like a crutch. Need rewrite.
    .replace(/(.*?)<.+?>(.+?)/g, '$1$2')

  return place
}
