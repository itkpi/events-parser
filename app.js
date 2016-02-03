const fs = require('fs')
const xml2js = require('xml2js')
const util = require('util')

/**
 * Save old file
 */
fs.readFile(__dirname + '/new_data.json', (err, data) => {
  if (err) throw err

  fs.writeFile(__dirname + '/old_data.json', data, (err) => {
    if (err) throw err
    console.log('Done: write old file')
  })
  console.log('Done: read old file')
})

/**
 * Parse new file
 */
const parseString = xml2js.parseString
fs.readFile('/test.xml', (err, data) => { //TODO: https://toster.ru/q/199773
  if (err) throw err

  var result
  var parse = parseString(data, (err, parse) => {
    if (err) throw err
    console.log('Done: parse new file')
    result = util.inspect(parse, false, null)
  })

  fs.writeFile(__dirname + '/new_data.json', result, (err) => {
    if (err) throw err
    console.log('Done: write new file')
  })
  console.log('Done: read new file')
})
