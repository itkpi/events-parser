'use strict'

const fs = require('fs-extra')

exports._log_ = (log, name) => {
  let d = new Date()
  if (!name) name = d.getMonth()

  fs.appendFile(`./logs/${d.getFullYear()}_${name}`, `${d}: ${log}\n`, (err) => {
    if (err) throw err
  })
}
