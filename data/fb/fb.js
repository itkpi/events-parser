'use strict'

const request = require('sync-request')

const fb = {}
module.exports = fb


fb.get = () => {

  let srcName = 'fb_prjctrcomua'
  let groupLink = srcName.slice(3)

  let accessToken = '305896496426277%7CLkD-5VFOcD5fcF8DE8Zfta2_saI'

  let res = request('GET', `https://graph.facebook.com/${groupLink}/events?access_token=${accessToken}`)
  res = JSON.parse(res.getBody().toString('utf-8'))

  return res.data[0]
}

//https://graph.facebook.com/prjctrcomua/events?access_token=305896496426277%7CLkD-5VFOcD5fcF8DE8Zfta2_saI