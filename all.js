// https://codepen.io/caesarsol/pen/dNejPG

function stringifyAttribute(value) {
  if (typeof value === 'string') return value
  return Object.entries(value).map(([key, val]) => {
    const tKey = key.replace(/[A-Z]/g, c => ('-' + c).toLowerCase())
    const tVal = (typeof val === 'number')
      ? val.toString() + 'px'
      : val
    return `${tKey}:${tVal}`
  }).join(';')
}

function tag(tagName, attributes = null, ...children) {
  // console.log(arguments)
  // console.log(children)
  const element = document.createElement(tagName)

  if (attributes) {
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, stringifyAttribute(value))
    })
  }

  children.map(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child))
    } else {
      element.appendChild(child)
    }
  })

  return element
}

const t = tag
// const h = t('div', { style: { color: 'steelblue'} },
// t('h1', {}, 'Title'),
// t('h2', {}, 'Subtitle'),
// 'text'
// )

;(async function() {
  let [allHanziAnkiInfo, ruPinyinText] = await asyncLoadInfoAndText()

  let ruPinyinArray = ruPinyinTextToArray(ruPinyinText)

  ruPinyinArray = ruPinyinArray.map(text => {
    const hanzi = uniq([...(removeLinks(text))].filter(isHanzi))

    return t("tr", {},
      t("td", { class: "hanzis" },
        ...hanzi.map(hanzi => {
          return t("pre", {},
            showDummyAnkiInfo({ allHanziAnkiInfo, hanzi })
          )
        })
      ),
      t("td", {},
        t("pre", {}, text)
      )
    )
  })

  const h = t("table", {},  ...ruPinyinArray)

  document.getElementById('root').appendChild(h)
})();

