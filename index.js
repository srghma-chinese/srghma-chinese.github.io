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

function recomputeCacheAndThrowIfDuplicate(ruPinyinArray) {
  const arrayOfValuesToObject = ({ arrayOfKeysField, valueField, array }) => {
    const buffer = {}
    const duplicateKeys = []

    array.forEach(arrayElement => {
      arrayElement[arrayOfKeysField].forEach(key => {
        if (buffer.hasOwnProperty(key)) { duplicateKeys.push(key) }
        buffer[key] = arrayElement[valueField]
      })
    })

    if (duplicateKeys.length > 0) { throw new Error(`duplicateKeys: ${JSON.stringify(uniq(duplicateKeys))}`) }

    return buffer
  }

  return arrayOfValuesToObject({
    arrayOfKeysField: "hanzi",
    valueField: "text",
    array: ruPinyinArray.map(text => ({
      text,
      hanzi: uniq([...(removeLinks(text))].filter(isHanzi)),
    }))
  })
}

///////////////////////////////////////////

// const { JSDOM } = jsdom;
// const dom = new JSDOM(``);

require("child_process").execSync(`${__dirname}/node_modules/.bin/browserify ${__dirname}/list-of-sentences-common.js -o ${__dirname}/list-of-sentences-common-bundle.js -t [ babelify --presets [ @babel/preset-env ]]`)

const dbPath = `${__dirname}/ru-pinyin.txt`
const db = (function () {
  return {
    getKeys: () => {
      let ruPinyinArray = ruPinyinTextToArray(require('fs').readFileSync(dbPath).toString())
      let ruPinyinObjectCache = recomputeCacheAndThrowIfDuplicate(ruPinyinArray)
      return Object.keys(ruPinyinObjectCache)
    },
    getHanziInfo: (hanzi) => {
      let ruPinyinArray = ruPinyinTextToArray(require('fs').readFileSync(dbPath).toString())
      let ruPinyinObjectCache = recomputeCacheAndThrowIfDuplicate(ruPinyinArray)
      const text = ruPinyinObjectCache[hanzi]
      return text
    },
    setInstead: async ({ oldText, newText }) => {
      let ruPinyinArray = ruPinyinTextToArray(require('fs').readFileSync(dbPath).toString())

      const getHanziStr = text => {
        return R.uniq([...text].filter(isHanzi)).sort().join('')
      }

      const oldTextHanzi = getHanziStr(oldText)

      let success = false
      if (oldText === '') {
        ruPinyinArray.push(newText)
        success = true
      } else {
        ruPinyinArray = ruPinyinArray.map(text => {
          text = R.trim(text)
          const textHanzi = getHanziStr(text)

          if (textHanzi === oldTextHanzi) {
            text = newText
            success = true
          }

          return text
        })
      }

      if (!success) {
        throw new Error(`oldText is not found. reload`)
      }

      const removeTrailingWhitespace = x => x.split('\n').map(x => x.trim()).join('\n').trim()

      ruPinyinArray = ruPinyinArray.filter(Boolean).sort().map(removeTrailingWhitespace)

      recomputeCacheAndThrowIfDuplicate(ruPinyinArray)

      await require('fs/promises').writeFile(dbPath, ruPinyinArray.join('\n\n----\n\n') + '\n')
    },
  }
})();

;(async () => {
  /////////////////////////////////////////
  let allPeppaFiles = await require('fs/promises').readdir(`${__dirname}/peppa`)
  allPeppaFiles = allPeppaFiles.filter(x => x.endsWith('.json')).map(basename => { // xxxx.json
    // console.log(basename)
    // let basename = require('path').basename(filePath) // xxxx.json
    let absolutePath = `${__dirname}/peppa/${basename}`
    let name = require('path').parse(basename).name // xxxx

    const url = `/peppa/${name}.html`

    const allHtmlFilesOfCurrent = allPeppaFiles.filter(x => x.endsWith('.html') && x.startsWith(name)).map(x => x.replace('.html', '').replace(`${name}.`, ''))
    // console.log({ allHtmlFilesOfCurrent, name })

    // let englishFilename = allHtmlFilesOfCurrent.find(x => x === 'en-GB' || x === 'en')
    // let everythingFilename = allHtmlFilesOfCurrent.find(x => x === 'zh-CN' || x === 'zh-HK')

    // console.log({
    //   englishFilename,
    //   everythingFilename,
    //   name
    // })

    return {
      allHtmlFilesOfCurrent,
      name,
      basename,
      absolutePath,
      url,
    }
  })

  /////////////////////////////////////////

  function render(html) {
    return `<!DOCTYPE HTML>
    <html>
     <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${html.title}</title>
      <meta name="referrer" content="no-referrer">
      ${html.css.map(x => `<link rel="stylesheet" href="${x}">`).join('\n')}
      <link rel="stylesheet" href="index.css">
      <link rel="stylesheet" href="../list-of-sentences-common.css">
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9842250826106845" crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/canvas-drawing-board@latest/dist/canvas-drawing-board.js"></script>
      <script defer src="../list-of-sentences-common-bundle.js"></script>
     </head>
     <body>
      <div id="container">
        <div id="body">
          ${html.body}
        </div>
        <footer>
          <div id="app" style="position: relative; width: 100%; height: 300px"></div>
          <div id="currentSentence"></div>
          <div id="currentSentenceTraditional"></div>
          <div class="controllers">
            <audio controls id="baidu-tts-audio"></audio>
            <audio controls id="google-tts-audio"></audio>
            <div class="buttons">
              <button id="clear-canvas">Clear</button>
              <button id="pleco">Pleco</button>
            </div>
          </div>
        </footer>
      </div>
     </body>
    </html>
    `
  }

  let app = {}

  let harariContent = await require('fs/promises').readFile('./books/未来简史-by-哈拉瑞Yuval-Noah-Harari_-林俊宏-_z-lib.org_.txt')
  harariContent = harariContent.toString()

  let hskContent = await require('fs/promises').readFile('./books/hsk')
  hskContent = hskContent.toString()
  // console.log(hskContent)

  app['/elon-musk/unknown-hanzi.html'] = async () => {
    const setOfKnownHanzi = db.getKeys()

    let allPeppaFiles_ = await Promise.all(allPeppaFiles.map(async x => {
      const hanzi = await require('fs/promises').readFile(x.absolutePath)
      return {
        ...x,
        hanzi,
      }
    }))

    allPeppaFiles_ = allPeppaFiles_.map(x => {
      return {
        ...x,
        hanzi: R.uniq([...(x.hanzi.toString())].filter(isHanzi)),
      }
    })

    let allPeppaHanzi = allPeppaFiles_.map(x => x.hanzi).flat()
    // allPeppaHanzi = R.uniq(allPeppaHanzi)

    let allElonHanzi = require('./elon-musk/index.json').htmlContent
    allElonHanzi = [...allElonHanzi].filter(isHanzi)
    // allElonHanzi = R.uniq(allElonHanzi)

    let allHarariHanzi = [...harariContent].filter(isHanzi)
    // allHarariHanzi = R.uniq(allHarariHanzi)

    let allHskHanzi = [...hskContent].filter(isHanzi)
    // allHskHanzi = R.uniq(allHskHanzi)
    // console.log(allHarariHanzi)

    // const hanzi = R.difference(allElonHanzi, R.uniq([...setOfKnownHanzi, ...allPeppaHanzi]))

    let allHanzi = R.difference(R.uniq([
      ...allHskHanzi,
      ...allElonHanzi,
      ...allPeppaHanzi,
      ...allHarariHanzi
    ]), setOfKnownHanzi)

    let allHanziWithPinyin = allHanzi.map(x => {
      return {
        x,
        p: ((hanzijs.getPinyin(x) || [])[0] || '').toLowerCase()
      }
    })

    // console.log(allHanziWithPinyin)
    allHanziWithPinyin = R.groupBy(R.prop('p'), allHanziWithPinyin)
    allHanziWithPinyin = R.toPairs(allHanziWithPinyin)
    allHanziWithPinyin = R.sortBy(R.prop(0), allHanziWithPinyin)

    const html = `<!DOCTYPE HTML>
    <html>
     <head>
       <meta charset="utf-8">
       <title>Elon Musk (unknown hanzi)</title>
       <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">
       <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9842250826106845" crossorigin="anonymous"></script>
     </head>

     <link href="unknown-hanzi.css" rel="stylesheet">
     <body class="nightMode">
      <div id="container-left">
        <button onclick="openNextHanzi()">Click</button>
        <ul>
          ${allHanzi.length}
          ${allHanziWithPinyin.map(([p, hanzis]) => {
            hanzis = hanzis.map(({ x }) => `<a target="_blank" href="/h.html#${x}">${x}</a>`)
            return `<p>${p}</p>${hanzis}`
          }).join('<br>')}
        </ul>
      </div>
      <div id="container-right"></div>
      <script src="../myscript-common.js"></script>
      <script src="unknown-hanzi.js"></script>
     </body>
    </html>`

    return html
  }

  app['/elon-musk/index.html'] = async () => {
    // const knownHanzi = db.getKeys()
    let html = require('./elon-musk/index.json')

    let htmlContent = html.htmlContent

    const body = `
    <div><ul>${html.toc.map(x => '<li>' + x + '</li>').join('\n')}</ul></div>
    ${htmlContent}
    `

    return render({
      title: html.title,
      css: html.css,
      body
    })
  }

  app[`/peppa/index.html`] = async () => {
    const allKnown = db.getKeys()

    let allPeppaFiles_ = Promise.all(allPeppaFiles.map(async x => {
      const hanzi = await require('fs/promises').readFile(x.absolutePath)
      return {
        ...x,
        hanzi,
      }
    }))

    allPeppaFiles_ = await allPeppaFiles_

    allPeppaFiles_ = allPeppaFiles_.map(x => {
      return {
        ...x,
        hanzi: R.uniq([...(x.hanzi.toString())].filter(isHanzi)),
      }
    })

    const links = allPeppaFiles_.map(x => {
      const allHtmlFilesOfCurrent = x.allHtmlFilesOfCurrent.map(enOrZh => `<a target="_blank" href="/peppa/${x.name}.${enOrZh}.html">${enOrZh}</a>`).join('&nbsp;&nbsp;&nbsp;')

      const hanzi = R.difference(x.hanzi, allKnown)

      return `<li><a target="_blank" href="${x.url}">${x.name}</a>&nbsp;&nbsp;&nbsp;(${allHtmlFilesOfCurrent})&nbsp;&nbsp;&nbsp;${hanzi.map(x => `<a target="_blank" href="/h.html#${x}">${x}</a>`)}</li>`
    }).join('\n')

    let allPeppaHanzi = allPeppaFiles_.map(x => {
      return x.hanzi
    }).flat()
    allPeppaHanzi = R.uniq(allPeppaHanzi)

    const html = `<!DOCTYPE HTML>
    <html>
     <head>
       <meta charset="utf-8">
       <title>Peppa</title>
       <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">
       <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9842250826106845" crossorigin="anonymous"></script>
     </head>
     <body>
     <ul>
      ${R.difference(allPeppaHanzi, allKnown).length}
      <br>
      ${links}
      </ul>
     </body>
    </html>
    `
    return html
  }

  allPeppaFiles.map(({ basename, absolutePath, name, url }) => {
    app[url] = async () => {
      const setOfKnownHanzi = new Set(db.getKeys())
      let html = require(absolutePath)
      const body = `
      <div>${html.map(subtitle => {
        let separators = "？！，。。《》"
        separators = [...separators]

        subtitle = subtitle.split('\n').map(subtitle => {
          subtitle = [...subtitle]
          // console.log(subtitle)
          subtitle = splitBySeparator(x => separators.includes(x), subtitle)
          // console.log(subtitle)

          subtitle = subtitle.map(text => {
            const colorizer = ch => {
              const isKnown = setOfKnownHanzi.has(ch)
              return isKnown ? `<span class="known-hanzi">${ch}</span>` : ch
            }

            text = [...text].map(ch => isHanzi(ch) ? colorizer(ch) : ch).join('')

            return '<sentence>' + text + '</sentence>'
          }).join('')
          return subtitle
        }).join('<br>')

        return '<div class="subtitle">' + subtitle + '</div>'
      }).join('\n')}</div>
      `
      return render({
        title: name,
        css: [],
        body
      })
    }
  })

  app[`/all.html`] = async () => {
    let html = `<!DOCTYPE HTML>
    <html>
      <head>
        <meta charset="utf-8">
        <title>All</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">
        <link rel="stylesheet" href="all.css">
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9842250826106845" crossorigin="anonymous"></script>
      </head>
      <body>
        <div id="root"></div>
      </body>
      <script src="myscript-common.js"></script>
      <script src="all.js"></script>
    </html>`

    return html
  }

  app[`/index.html`] = async () => {
    let html = `
      Hanzi table (front) | f.html
      Hanzi table (back) | b.html
      Info for example hanzi (段) | h.html#段
      Sherlock book | sherlock.html
      Peppa | peppa/index.html
      Elon Musk | elon-musk/index.html
      Elon Musk (unknown hanzi) | elon-musk/unknown-hanzi.html
      Word dictionary - list | dict.html
      Word dictionary - list (hsk) | dict-hsk.html
      Word dictionary - list (7000 first hanzi) | dict-7000.html
      Word dictionary - table | dict-show-transl.html
      Word dictionary - table (6000 first hanzi) | dict-show-6000-transl.html
    `

    html = html.trim().split('\n').map(x => x.split('|').map(R.trim))
    html = html.map(([h, link]) => `<li><a href="${link}">${h}</a></li>`).join('\n')

    html = `<!DOCTYPE HTML>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Index</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9842250826106845" crossorigin="anonymous"></script>
      </head>
      <body>
      <ul>
      ${html}
      </ul>
      </body>
    </html>`

    return html
  }

  app = R.toPairs(app)

  await Promise.all(app.map(async ([url, render]) => {
    const text = await render()

    await require('fs/promises').writeFile(`.${url}`, text)
  }))

  // app.get('/list-of-known-hanzi', (req, res) => {
  //   res.send(db.getKeys())
  // })

  // app.get('/hanzi-info', (req, res) => {
  //   // console.log(req.query)
  //   const text = db.getHanziInfo(req.query.hanzi)
  //   if (text === '') { throw new Error() }
  //   res.send(text || '')
  // })
})();
