const containerId = 'kanjiIframeContainer'

// function waitForElementToAppear(get) {
//   return new Promise(function (resolve, reject) {
//       (function doWait(){
//         const element = get()
//         if (element) return resolve(element)
//         setTimeout(doWait, 0)
//       })();
//   });
// }

// window.copyToClipboard = (
//   value,
//   successfully = () => null,
//   failure = () => null
// ) => {
//   const clipboard = navigator.clipboard;
//   if (clipboard !== undefined && clipboard !== "undefined") {
//     navigator.clipboard.writeText(value).then(successfully, failure);
//   } else {
//     if (document.execCommand) {
//       const el = document.createElement("input");
//       el.value = value;
//       document.body.append(el);

//       el.select();
//       el.setSelectionRange(0, value.length);

//       if (document.execCommand("copy")) {
//         successfully();
//       }

//       el.remove();
//     } else {
//       failure();
//     }
//   }
// };

;(function() {
  function reset() {
    const removeClassFromAllElements = kl => {
      // console.log(kl)
      Array.from(document.querySelectorAll('.' + kl)).forEach(el => {
        // console.log(el)
        el.classList.remove(kl)
      })
    }
    [ "my-pinyin-translation-container--force-show", "my-pinyin-hanzi--force-show", "pinyin__root_container--show" ].forEach(removeClassFromAllElements)

    if (window.location.pathname.replace('.html', '') === "/h") {
      document.getElementById(containerId).innerHTML = ''
    }
  }

  window.showRootContainer = function(pinyin) {
    reset()
    document.getElementById(`pinyin__root_container__${pinyin}`).classList.add('pinyin__root_container--show')
  }

  if (window.location.pathname.replace('.html', '') !== "/h") {
    if(window.location.hash) {
      try {
        const tablePinyin = window.location.hash.slice(1)
        window.showRootContainer(tablePinyin)
        document.title = tablePinyin
        // el.scrollIntoView({
        //   behavior: 'smooth', // smooth scroll
        //   block: 'start' // the upper border of the element will be aligned at the top of the visible part of the window of the scrollable area.
        // })
      } catch (e) {
        console.error(e)
      }
    }
  }
})();

;(function() {
  window.showKanjiIframe = async function(hanziEncoded) {
    if (window.location.pathname.replace('.html', '') !== "/h") {
      window.open(`h.html#${hanziEncoded}`, '_blank').focus()
      // window.copyToClipboard(hanziEncoded)
      return
    }
  }
})();

;(function() {
  if (window.location.pathname.replace('.html', '') !== "/h") {
    function enhanceWithLinkToH(containerElement) {
      // onmouseover="window.copyToClipboard('${ch} ')"
      const colorizer = (ch, colorIndex) => `<span onclick="window.showKanjiIframe('${ch}')">${ch}</span>`
      const ruby_chars = [...containerElement.innerHTML]
      containerElement.innerHTML = ruby_chars.map(ch => isHanzi(ch) ? colorizer(ch) : ch).join('')
    }

    Array.from(document.querySelectorAll('.my-pinyin-hanzi')).forEach(enhanceWithLinkToH)
  }
})();

;(async function() {

  if (window.location.pathname.replace('.html', '') === "/h" && window.location.hash) {
    const hanziEncoded = window.location.hash.slice(1)

    const hanzi = decodeURIComponent(hanziEncoded)
    if (!hanzi) { return }

    const { allHanziAnkiInfo, hanziAnkiInfo, ruPinyinText } = await asyncLoadHanziAnkiInfoAndAllAnkiInfoAndText(hanzi)

    // console.log(hanziAnkiInfo)

    const containerElement = document.getElementById(containerId)
    if (hanziAnkiInfo) {
      showText(containerElement, hanziAnkiInfo.rendered)
    }
    document.title = hanzi

    // console.log(hanziAnkiInfo)

    // play audio
    ;(async function() {
      try {
        const firstAudio = Array.from(document.querySelectorAll('.my-pinyin-tone a')).map(x => x.href).filter(x => x.endsWith('.mp3'))[0]

        if (!firstAudio) { return }

        const audioEl = document.createElement('audio');
        audioEl.style.cssText = 'display: none;';
        audioEl.src = firstAudio
        audioEl.load()
        audioEl.autoplay = true;

        document.body.addEventListener('click', () => {
          audioEl.play().catch(e => {
            console.log(e)
            // document.body.innerHTML = e.toString()
          })
        }, { once: true });

        // await audioEl.play()
        document.body.appendChild(audioEl)
      } catch (e) {
        document.body.innerHTML = e.toString()
      }
    })();
    //////

    ruPinyinObject = recomputeCacheAndThrowIfDuplicate(ruPinyinTextToArray(ruPinyinText))

    const ruPinyinPreDummyElement = document.createElement('pre')
    ruPinyinPreDummyElement.style.cssText = 'width:100%;background:rgb(192,192,192); text-align: start; color: black;'
    ruPinyinPreDummyElement.textContent = showDummyAnkiInfo({ allHanziAnkiInfo, hanzi })
    window.document.body.insertBefore(ruPinyinPreDummyElement, window.document.body.firstChild)

    console.log(ruPinyinObject[hanzi])
    console.log(allHanziAnkiInfo[hanzi])
    // if (false) {
    if (ruPinyinObject.hasOwnProperty(hanzi)) {
      const ruPinyinPreElement = document.createElement('pre')
      ruPinyinPreElement.style.cssText = 'width:100%;background:rgb(192,192,192); text-align: start; color: black;'
      window.document.body.insertBefore(ruPinyinPreElement, window.document.body.firstChild)
      ruPinyinPreElement.textContent = ruPinyinObject[hanzi]
    }
  }
})();

////////////

;(function() {
function hideByDefaultAndShowOnClick(elements, classToAddToShow) {
  Array.from(document.getElementsByClassName(elements)).forEach((element) => {
    element.classList.add(classToAddToShow);

    // function eventListener(event) {
    //   event.preventDefault();
    //   element.classList.add(classToAddToShow);
    //   // element.removeEventListener('click', eventListener);
    // }
    // element.addEventListener('click', eventListener);
  });
}
hideByDefaultAndShowOnClick("my-pinyin-translation-container", "my-pinyin-translation-container--force-show")
hideByDefaultAndShowOnClick("my-pinyin-hanzi", "my-pinyin-hanzi--force-show")
})();

;(function() {
  function show(parentElement, elementsToFindClass, classToAddToShow) {
    Array.from(parentElement.getElementsByClassName(elementsToFindClass)).forEach((element) => {
      element.classList.add(classToAddToShow)
    })
  }
  function eventListener(event) {
    event.preventDefault();
    const parentElement = event.target.parentElement
    show(parentElement, "my-pinyin-translation-container", "my-pinyin-translation-container--force-show")
    show(parentElement, "my-pinyin-hanzi", "my-pinyin-hanzi--force-show")
  }
  Array.from(document.querySelectorAll("h1")).forEach((element) => {
    show(element, "my-pinyin-translation-container", "my-pinyin-translation-container--force-show")
    show(element, "my-pinyin-hanzi", "my-pinyin-hanzi--force-show")

    element.addEventListener('click', eventListener)
  })
})();

;(function() {
  const table = document.querySelector('table')
  if (table && document.body.offsetWidth < table.offsetWidth) {
    document.body.style.width = `${table.offsetWidth}px`
  }
})();
