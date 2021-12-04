#!/usr/bin/env node
'use strict';

const path = require('path')
const serveStatic = require('serve-static')
const R = require('ramda')
const isHanzi = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/isHanzi').isHanzi
const splitBySeparator = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/splitBySeparator').splitBySeparator
const TongWen = require('/home/srghma/projects/anki-cards-from-pdf/scripts/lib/TongWen').TongWen
const hanzijs = require("hanzi");
//Initiate
hanzijs.start();

///////////////////////////////////////////

const uniq = array => [...new Set(array)]
const removeLinks = x => x.replace(/<link>[^<]*<\/link>/g, '')

function ruPinyinTextToArray(text) {
  return text.split(/―{4,}|-{4,}/).map(x => x.trim())
}

const dbPath = `${__dirname}/ru-pinyin.txt`
let ruPinyinArray = ruPinyinTextToArray(require('fs').readFileSync(dbPath).toString())

ruPinyinArray = ruPinyinArray.map(text => ({
  text,
  hanzi: uniq([...(removeLinks(text))].filter(isHanzi)),
}))

ruPinyinArray = ruPinyinArray.filter(Boolean).sort().map(removeTrailingWhitespace)

await require('fs/promises').writeFile(dbPath, ruPinyinArray.join('\n\n----\n\n') + '\n')
