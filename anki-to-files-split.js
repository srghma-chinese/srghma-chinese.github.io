const path = require('path')
const R = require('ramda')

x = require('fs').readFileSync('./files/anki.json').toString()
x = JSON.parse(x)

R.values(x).forEach(x => {
  require('fs/promises').writeFile(`./files-split/${x.kanji}.json`, JSON.stringify(x))
})

// require('fs/promises').writeFile('./anki-addon-glossary/anki-addon-glossary.json', JSON.stringify(x, undefined, 2))
