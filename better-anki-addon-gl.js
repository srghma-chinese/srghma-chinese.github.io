const path = require('path')
const serveStatic = require('serve-static')
const R = require('ramda')

x = require('fs').readFileSync('./anki-addon-glossary/anki-addon-glossary.json').toString()
x = JSON.parse(x)

function omit(obj) {
  obj = {...obj}
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
    if (obj[key] === null) {
      delete obj[key];
    }
    if (obj[key] === "") {
      delete obj[key];
    }
  })
  return obj
}

x = R.map(omit, x)

require('fs/promises').writeFile('./anki-addon-glossary/anki-addon-glossary.json', JSON.stringify(x))
// require('fs/promises').writeFile('./anki-addon-glossary/anki-addon-glossary.json', JSON.stringify(x, undefined, 2))
