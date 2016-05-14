'use strict'

const fs = require('fs-extra')

var date
exports._log_ = (log) => {
  let d = new Date()
  date = d.getDate()
  fs.appendFile('./logs/' + date, d.toTimeString() + ': ' + log + '\n', (err) => {
    if (err) throw err
  })
}

exports.removeOld = () => {
  if (date < 10) date += 30

  fs.remove('./logs/' + (date - 10), (err) => {
    if (err) throw err
  })
}
