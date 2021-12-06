;(async function() {
  if (window.location.host === 'srghma-chinese.github.io') { return }

  const allHanziAnkiInfo = await allHanziAnkiInfoPromise()

  const hanzisInfo = Array.from(document.querySelectorAll('a')).map(x => x.textContent).map(x => allHanziAnkiInfo[x]).filter(x => x)

  hanziDummyInfo = hanzisInfo.map(hanziAnkiInfo => showDummyAnkiInfo({ allHanziAnkiInfo, hanzi: hanziAnkiInfo.kanji }))
  // hanziDummyInfo = await Promise.all(hanziDummyInfo)
  hanziDummyInfo = hanziDummyInfo.join('\n-----\n\n')

  const ruPinyinPreElement = document.createElement('pre')
  ruPinyinPreElement.id = 'ru-pinyin-pre'
  ruPinyinPreElement.textContent = hanziDummyInfo
  ruPinyinPreElement.style.cssText = 'width:100%;background:rgb(192,192,192); text-align: start; color: black;'

  const parentContainer = document.querySelector('#container-right')
  parentContainer.insertBefore(ruPinyinPreElement, parentContainer.firstChild)
})();

// const alreadyVisitedHanzi = []
function openNextHanzi() {
  const element = Array.from(document.querySelectorAll('a'))
  const hanzi = element.textContent
  const hanzi_ = encodeURIComponent(hanzi)
  window.open("https://baike.baidu.com/item/" + hanzi_, '_blank')
  window.open("../h.html#" + hanzi_, '_blank')
  window.open("../h.html#" + hanzi_)
}

document.body.addEventListener('keyup', function (event) {
  if (event.key === "n") {
    openNextHanzi()
  }
})
