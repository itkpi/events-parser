'use strict'

const assert = require('assert')
const fs = require('fs-extra')
const { dataIO, dataIOTests } = require('../../data/dataIO.js')
const util = require('util')
const links = require(`${__dirname}/../fake_data/link/links.js`).links

const path = `${__dirname}/../fake_data`
const types = ['xml', 'json', 'rawAin']
const sources = ['dou', 'meetup', 'ain', 'fb', 'bigCityEvent']
