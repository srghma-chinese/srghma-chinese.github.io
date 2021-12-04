function ruPinyinTextToArray(text) {
  return text.split(/―{4,}|-{4,}/).map(x => x.trim())
}

const removeLinks = x => x.replace(/<link>[^<]*<\/link>/g, '')

const asyncLoadInfoAndText = () => Promise.all([
  fetch('files/anki-addon-glossary.json').then(x => x.json()),
  fetch(`ru-pinyin.txt`).then(x => x.text()),
])

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

  ruPinyinArray = ruPinyinArray.map(text => {
    const hanzi = uniq([...(removeLinks(text))].filter(isHanzi))

    return {
      text,
      hanzi,
    }
  })

  // console.log(ruPinyinArray)

  return arrayOfValuesToObject({
    arrayOfKeysField: "hanzi",
    valueField: "text",
    array: ruPinyinArray,
  })
}

/////////////////////////////////

const REGEX_JAPANESE = /[\u3040-\u309f]|[\u30a0-\u30ff]|[\u4e00-\u9faf]|[\u3400-\u4dbf]/
const REGEX_CHINESE = /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/;

const specialChar = "。？！，"
// Hiragana: [\u3040-\u309f]
// Katakana: [\u30a0-\u30ff]
// Roman characters + half-width katakana: [\uff00-\uff9f]
// Roman characters + half-width katakana (more): [\uff00-\uffef]
// Kanji: [\u4e00-\u9faf]|[\u3400-\u4dbf]

function isHanzi(ch) {
  if ([...ch].length !== 1) { throw new Error(`'${ch}' is not length 1`) }
  return !specialChar.includes(ch) && (REGEX_JAPANESE.test(ch) || REGEX_CHINESE.test(ch))
}

/////////////////////////////////

const uniq = array => [...new Set(array)]

function showText(containerElement, text) {
  // console.log(text)

  if (window.location.host === 'srghma-chinese.github.io') {
    // <img src="https://www.unicode.org/cgi-bin/refglyph?24-5DE5"
    // <img src="asdfasdf.png"
    // <img src="hanziyan-J11022.png"/>
    // <img src='lf_24037.gif">
    text = text.replace(/<img src=("|')(?!https?\:\/\/)/g, '<img src=$1https://srghma-chinese-files.github.io/collection.media/')
    // href="allsetlearning-gong1.mp3"
    text = text.replace(/href="([^\.]+)\.mp3"/g, 'href="https://srghma-chinese-files.github.io/collection.media/$1.mp3"')
  } else {
    text = text.replace(/<img src=("|')(?!https?\:\/\/)/g, '<img src=$1files/collection.media/')
    text = text.replace(/href="([^\.]+)\.mp3"/g, 'href="files/collection.media/$1.mp3"')
  }

  containerElement.innerHTML = text

  function enhanceWithLinkToH(containerElement) {
    // const colorizer = (ch, colorIndex) => `<a target="_blank" href="plecoapi://x-callback-url/s?q=${ch}">${ch}</a>`
    const colorizer = (ch, colorIndex) => `<a target="_blank" href="h.html#${ch}">${ch}</a>`
    // const colorizer = (ch, colorIndex) => `<div onclick="window.copyToClipboard('${ch}')">${ch}</div>`
    const ruby_chars = [...containerElement.innerHTML]
    containerElement.innerHTML = ruby_chars.map(ch => isHanzi(ch) ? colorizer(ch) : ch).join('')
  }

  Array.from(document.querySelectorAll('[data-enhance-with-pleco]')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#chinese_opposite')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#ch_with_same_pronounciation')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#Ru_trainchinese')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#origin_of_ch_char_book')).forEach(enhanceWithLinkToH)
  // Array.from(document.querySelectorAll('#rtega_mnemonic')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#purpleculture_info')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#purpleculture_tree')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#purpleculture_examples')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#myStory')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#heisig_constituent')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#humanum_small_description')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#humanum_small_description_en')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#humanum_full_description')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#humanum_full_description_en')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#baidu_chinese')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#baidu_chinese_en')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#hanziyuan')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#yw11')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#yw11_en_transl')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#yw11_image_chinese')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#yw11_image_ru_transl')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#bkrs_pinyin')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('#bkrs_transl')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('.my-pinyin-english')).forEach(enhanceWithLinkToH)
  Array.from(document.querySelectorAll('.my-pinyin-ru')).forEach(enhanceWithLinkToH)
  // Array.from(document.querySelectorAll('.dictips')).forEach(enhanceWithLinkToH)
  // Array.from(document.querySelectorAll('.yw11_image__container')).forEach(enhanceWithLinkToH)
  // Array.from(document.querySelectorAll('.trainchinese-transl')).forEach(enhanceWithLinkToH)

  ///////////////////////////////////

  const elementsToAddTranslLinks = [
    document.getElementById("yw11"),
    document.getElementById("yw11_image_chinese"),
    document.getElementById("baidu_chinese"),
    document.getElementById("humanum_full_description"),
    document.getElementById("humanum_small_description"),
  ]

  // console.log('doing', elementsToAddTranslLinks)

  elementsToAddTranslLinks.filter(x => x).forEach(element => {
    const text = element.innerText.replace(/\n\n+/g, '\n\n').trim()
    // console.log(element, text)
    if (!text) { return }
    const encoded = encodeURIComponent(text)
    const baidu_url = `https://fanyi.baidu.com/#zh/en/` + encoded
    const deepl_url = `https://www.deepl.com/translator#zh/ru/` + encoded

    const link = (text, url) => `<a href="${url}" target="_blank">${text}</a>`
    const linksElement = document.createElement('div')
    linksElement.innerHTML = `${link('baidu', baidu_url)}, ${link('deepl', deepl_url)}`

    element.appendChild(linksElement)
  })
}

function strip(html) {
  let returnText = html

  //-- remove BR tags and replace them with line break
  returnText=returnText.replace(/<br>/gi, "\n");
  returnText=returnText.replace(/<br\s\/>/gi, "\n");
  returnText=returnText.replace(/<br\/>/gi, "\n");

  //-- remove P and A tags but preserve what's inside of them
  returnText=returnText.replace(/<p.*>/gi, "\n");
  returnText=returnText.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ($1)");

  //-- remove all inside SCRIPT and STYLE tags
  returnText=returnText.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
  returnText=returnText.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
  //-- remove all else
  returnText=returnText.replace(/<(?:.|\s)*?>/g, "");

  //-- get rid of more than 2 multiple line breaks:
  returnText=returnText.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "\n\n");

  //-- get rid of more than 2 spaces:
  returnText = returnText.replace(/ +(?= )/g,'');

  //-- get rid of html-encoded characters:
  returnText=returnText.replace(/&nbsp;/gi," ");
  returnText=returnText.replace(/&amp;/gi,"&");
  returnText=returnText.replace(/&quot;/gi,'"');
  returnText=returnText.replace(/&lt;/gi,'<');
  returnText=returnText.replace(/&gt;/gi,'>');
  returnText=returnText.replace(/^\s+/gm,'');
  return returnText
}

function showDummyInfo({ allHanziAnkiInfo, hanzi }) {
  const hanziInfo = allHanziAnkiInfo[hanzi]

  if (!hanziInfo) { return hanzi }

  // ... -> Array String
  function matchAllFirstMatch(input, regex) {
    return Array.from(input.matchAll(regex)).map(x => x[1])
  }

  function parseHtmlEntities(str) {
    var txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  }

  const rendered = parseHtmlEntities(hanziInfo.rendered)

  let otherKanji = [
    matchAllFirstMatch(rendered, /Traditional in your browser[^:]+:<\/b><span class="text-lg">(.+?)<\/span>/g),
    matchAllFirstMatch(rendered, /Older traditional characters[^:]+:<\/b><span class="text-lg">(.+?)<\/span>/g),
    matchAllFirstMatch(rendered, /Variant rule[^:]+:(.+?)<\/p>/g),
  ].flat().join('')

  otherKanji = [...otherKanji].filter(isHanzi)
  otherKanji = uniq(otherKanji).filter(x => x !== hanziInfo.kanji)

  let mainAndOtherKanji_kanji_and_glyphPronunciations = [hanzi, ...otherKanji].map(hanzi => {
    const hanziInfo = allHanziAnkiInfo[hanzi]

    if (!hanziInfo) { return hanzi }

    let glyphs = (hanziInfo.glyphs || []).map(x => (x.pinyins || [])[0]).filter(x => x).join(' + ')
    return [hanziInfo.kanji, glyphs].filter(x => x).join(' ')
  }).filter(x => x).join('\n')

  let Ru_trainchinese = hanziInfo.Ru_trainchinese || ""
  // console.log(Ru_trainchinese)
  Ru_trainchinese = strip(Ru_trainchinese)
  // console.log(Ru_trainchinese)

  Ru_trainchinese = Ru_trainchinese.replace(/^(.+?): \(.+?\)/gm, '$1')
  Ru_trainchinese = Ru_trainchinese.replace(/\(диал\.\)/g, '')
  Ru_trainchinese = Ru_trainchinese.replace(/\(книжн\.\)/g, '')

  // console.log(Ru_trainchinese)
  // console.log(strip(Ru_trainchinese))
  return [mainAndOtherKanji_kanji_and_glyphPronunciations, Ru_trainchinese].filter(x => x).join('\n') + '\n'
}
