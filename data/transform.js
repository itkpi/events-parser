/**
 * These functions are transforming the text.
 * By removing or replacing text is achieved a single design style of all events.
 */

'use strict'

exports.title = (data) => {
  data = data
    // Remove words 'free' and 'webinar'
    .replace(/(бесплат|вебин|безкоштовн|вебін)[а-я]+\s/ig, '')
    // Remove quotation mark
    .replace(/[",«,‘,“,„]+(.{0,})+[",»,’,”,“]/, '$1')
    // Remove dots on the end
    .replace(/(.{0,})(\.{1,})/, '$1')

  return data
}

exports.agenda = (data) => {
  data = data
    // Remove words 'free'
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

  return data
}

exports.social = (data) => {
  data = data
    // Change images width
    .replace(/(<img)(\sstyle=".+?")?(\ssrc="(.+?)")(\sstyle=".+?")?(>)/g, '$1 width="623"$3$6<br/>$4<br/>')

  return data
}

exports.place = (data) => {
  data = data
    // Remove 'Kyiv' from the field
    .replace(/(Киев|Київ|Kyiv|Kiev)(,\s)?/, '')
    // Remove html tags // FIX ME: It's look like a crutch. Need rewrite.
    .replace(/(.*?)<.+?>(.+?)/g, '$1$2')

  return data
}