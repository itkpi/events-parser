'use strict'

const assert = require('assert')
const fs = require('fs-extra')
const { dataIO, dataIOTests } = require('../../data/dataIO.js')
const util = require('util')
const links = require(`${__dirname}/../fake_data/link/links.js`).links

const path = `${__dirname}/../fake_data`
const types = ['xml', 'json', 'rawAin']
const sources = ['dou', 'meetup', 'ain', 'fb', 'bigCityEvent']

function get () {
  const srcName = 'testSrcName'
  const srcLink = 'https://google.com.ua'
  const srcType = 'testSrcType'
  const newJSON = `${path}/json/new.json`
  const oldJSON = `${path}/json/old.json`

  dataIO.get(srcName, srcType, srcLink, newJSON, oldJSON)

  const statsNew = fs.statSync(newJSON || __dirname)
  const statsOld = fs.statSync(oldJSON || __dirname)
  assert(statsNew.isFile(), 'Not created newJSON file')
  assert(statsOld.isFile(), 'Not created oldJSON file')
  assert(statsOld.size === 0, 'Something wrong in INITing')

  dataIO.get(srcName, srcType, srcLink, newJSON, oldJSON)

  const statsNewOld = fs.statSync(oldJSON || __dirname)
  assert.strictEqual(statsNew.mtime.toString(), statsNewOld.mtime.toString(), 'Not copied old file')

  // Remove test data
  fs.unlinkSync(newJSON)
  fs.unlinkSync(oldJSON)
  fs.rmdirSync(`${path}/json/`)
}

function convertToJson (types) {
  types.forEach((type) => {
    const dataType = fs.readFileSync(`${path}/convert.${type}`)
    const convertType = dataIOTests.convertToJson(dataType, type)
    const jsonType = fs.readFileSync(`${path}/${type}.json`).toString()
    assert.strictEqual(convertType, jsonType)
  })
}

function read (sources) {
  sources.forEach((source) => {
    const src = util.inspect(dataIO.read(source, `${path}/read/${source}.json`), 0, null)
    const srcRead = fs.readFileSync(`${path}/read/${source}Read`).toString()
    assert.strictEqual(src, srcRead)
  })
}

get()
convertToJson(types)
read(sources)
