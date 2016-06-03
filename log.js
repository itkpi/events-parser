'use strict'

const fs = require('fs-extra')

exports._log_ = (log, name) => {
  let d = new Date()
  if (!name) {
    name = d.getMonth() + 1
    if (name < 10) name = `0${name}`
  }

  fs.appendFile(`./logs/${d.getFullYear()}_${name}`, `${d}: ${log}\n`, (err) => {
    if (err) throw err
  })

  console.log(log)
}
