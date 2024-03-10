const { uniq } = require('lodash')
const dayjs = require('dayjs')
const { GalleryMode } = require('../constant')

/**
 * @param {Document} document
 * @param {int} mode
 */
function parseGalleryList(document, mode) {
  const res = [];
  let total = 0;

  console.log(document.documentElement.outerHTML); // Log the entire document

  // Check for elements before accessing textContent
  let ipElements = document.querySelectorAll('p.ip');
  if (mode === GalleryMode.FrontPage || mode === GalleryMode.Favorites) {
    if (ipElements.length > 0)
      total = parseInt(ipElements[0].textContent.replace(/[^0-9]/g, ''));
  }
  if (mode === GalleryMode.Watched) {
    if (ipElements.length > 1)
      total = parseInt(ipElements[1].textContent.replace(/[^0-9]/g, ''));
  }

  Array.from(document.querySelectorAll('.itg > tbody > tr')).slice(1).forEach((tr) => {
    try {
      // Extracting elements with safety checks
      let titleElement = tr.querySelector('.glink');
      let categoryElement = tr.querySelector('.cn');
      let postedElement = tr.querySelector('[id^=posted_]');
      let ratingElement = tr.querySelector('.ir');
      let uploaderElement = mode === GalleryMode.Favorites ? null : tr.querySelector('.gl4c a');
      let filecountElement = tr.querySelector('.glthumb');
      let thumbElement = tr.querySelector('.glthumb img');

      // Check each element before accessing its properties to prevent errors
      const title = titleElement ? titleElement.textContent : '';
      const category = categoryElement ? categoryElement.textContent : '';
      const posted = postedElement ? dayjs(postedElement.textContent, { utc: true }).valueOf() : null;
      const rating = ratingElement ? _parseRating(ratingElement.getAttribute('style')) : '';
      const uploader = uploaderElement ? uploaderElement.textContent : '';

      let url, filecount, gid, token, thumb;
      if (titleElement) {
        url = titleElement.parentElement.getAttribute('href');
        gid = _parseUrl(url)[0];
        token = _parseUrl(url)[1];
      }

      if (filecountElement) {
        let filecountMatch = filecountElement.textContent.match(/:\d\d(\d+) pages/);
        filecount = filecountMatch ? parseInt(filecountMatch[1]) : 0;
      }

      thumb = thumbElement ? (thumbElement.getAttribute('data-src') || thumbElement.getAttribute('src')) : '';

      // Extract tags safely
      const tagsElements = tr.querySelectorAll('.gl3c a div div');
      const tags = (tagsElements.length > 0) ? Array.from(tagsElements).map(tagRow => {
        const watched = tagRow.hasAttribute('style');
        const title = tagRow.textContent;
        const [namespace, tagName] = tagRow.getAttribute('title').split(':');
        return { watched, title, namespace, tagName };
      }) : [];

      res.push({
        gid,
        token,
        posted,
        title,
        category,
        rating,
        uploader,
        filecount,
        thumb,
        tags,
      });

    } catch (e) {
      console.error(e);
    }
  });

  if (mode === GalleryMode.Popular) total = res.length;

  return { list: res, total };
}

/**
 * @param {string} style
 * @return {number}
 */
function _parseRating(style) {
  let rating = 5.0
  const re = RegExp(/(-?\d+)px (-?\d+)px/)
  const res = style.match(re)
  const left = parseFloat(res[1])
  const top = parseFloat(res[2])
  rating += left / 16
  rating += top === -21 ? -0.5 : 0

  return rating
}

/**
 * @param { string } url
 * @returns {[string, string]}
 */
function _parseUrl(url) {
  const res = url.split('/').filter((element) => element !== '')
  const gid = res[res.length - 2]
  const token = res[res.length - 1]
  return [gid, token]
}
/**
 * 解析并去重url
 */
async function parseHTMLAnchorElement(document) {
  const as = document.querySelectorAll('a[href*=".org/g/"]')
  const pathnameList = Array.from(as)
    .map((a) => a.href)
    .map((url) => new URL(url).pathname.slice(3, -1))
  return uniq(pathnameList).map((pathname) => pathname.split('/'))
}

function parseDetailPageList(document) {
  const gdts = document
    .getElementById('gdt')
    .querySelectorAll('div[class^="gdt"')
  const filecount = parseInt(
    document
      .querySelector('#gdd table tr:nth-of-type(6) .gdt2')
      .textContent.replace(/[^0-9]/g, '')
  )
  return {
    list: Array.from(gdts).map((gdt) => {
      const aEl = gdt.querySelector('a')
      const imgEl = gdt.querySelector('img')

      return { thumb: imgEl.src, url: aEl.href }
    }),
    total: filecount,
  }
}

function parseDetailPageCommentList(document) {
  const divs = document.querySelectorAll('#cdiv .c1')

  if (divs.length === 0) return []

  return Array.from(divs).map((c1) => {
    const res = {}
    const c3 = c1.querySelector('.c3') // time + name
    const c5 = c1.querySelector('.c5 [id^=comment]') //  score
    const c6 = c1.querySelector('.c6') // comment
    const [, time, name] = c3.textContent
      ? c3.textContent.match(/Posted on (.*?)by:(.*)/).map((v) => v.trim())
      : []
    res.time = dayjs(time + 'Z', { utc: true }).valueOf()
    res.userName = name
    res.score = c5 ? c5.textContent : ''

    res.comment = c6.innerHTML
    return res
  })
}

function parseDetailPageTagList(document) {
  const trs = document.querySelectorAll('#taglist tr')

  if (trs.length === 0) return []
  return Array.from(trs).map((tr) => {
    const res = {}

    // parse tag Category
    res.namespace = tr.childNodes[0].innerHTML.slice(0, -1)
    res.tags = Array.from(tr.childNodes[1].children).map((div) => {
      const name = div.textContent
      const keyword = res.namespace + ':' + name
      const dash = div.className === 'gtl'
      return { name, keyword, dash }
    })
    return res
  })
}

/**
 * @param { Document } document
 * @param { string } html
 */
function parseDetailPageInfo(document, html) {
  const rating_count = document.getElementById('rating_count').textContent

  let favoritelink = document.getElementById('favoritelink').textContent
  if (favoritelink.includes('Add to Favorites')) favoritelink = ''

  const favcount = document
    .getElementById('favcount')
    .textContent.replace(/[^0-9]/g, '')

  const gid = html.match(/var gid = (\d+);/)[1]
  const token = html.match(/var token = "(.*)";/)[1]
  const rating = html.match(/var average_rating = ([0-9.]+)?;/)[1]
  const thumb = html.match(/background:transparent url\((.*?)\)/)[1]
  const category = document.querySelector('#gdc div').textContent
  const title = document.querySelector('#gn').textContent
  const title_jpn = document.querySelector('#gj').textContent || title
  const uploader = document.querySelector('#gdn a').textContent
  const posted = dayjs(
    document.querySelector('#gdd table tr:nth-of-type(1) .gdt2').textContent,
    { utc: true }
  ).valueOf()
  const language = document
    .querySelector('#gdd table tr:nth-of-type(4) .gdt2')
    .textContent.trim()
  const filesize = document.querySelector(
    '#gdd table tr:nth-of-type(5) .gdt2'
  ).textContent
  const filecount = document
    .querySelector('#gdd table tr:nth-of-type(6) .gdt2')
    .textContent.replace(/[^0-9]/g, '')
  const torrentcount = document
    .querySelector('#gd5 p:nth-of-type(3) a')
    .textContent.replace(/[^0-9]/g, '')
  return {
    gid,
    token,
    title,
    title_jpn,
    thumb,
    posted,
    category,
    uploader,
    url: `https://exhentai.org/g/${gid}/${token}`,
    language,
    filesize,
    filecount,
    torrentcount,
    rating,
    rating_count,
    favcount,
    favoritelink,
  }
}
/**
 * @param {Document} document
 */
function parseBigImg(document) {
  const retryURL = document
    .getElementById('loadfail')
    .getAttribute('onclick')
    .match(/'(.*)'/)[1]
  return { url: document.getElementById('img').src, retryURL }
}

/**
 * @param { Document } document
 * @returns {{url:string, name:string, hash:string}[]}
 */
function parseTorrentList(document) {
  const tables = document.querySelectorAll('table')
  if (tables.length === 0) return []
  const list = Array.from(tables)
    .map((table) => {
      try {
        const trs = table.querySelectorAll('tr')
        const tr0tds = trs[0].querySelectorAll('td')
        const info = {}
        Array.from(tr0tds).forEach((td) => {
          const str = td.textContent
          if (str !== '') {
            const [key, value] = getKV(str)

            if (key.toLowerCase() === 'posted') {
              info[key.toLowerCase()] = dayjs(value, { utc: true }).valueOf()
            } else info[key.toLowerCase()] = value
          }
        })
        const tr1td0 = trs[1].querySelector('td')
        const [key, value] = getKV(tr1td0.textContent)
        info[key.toLowerCase()] = value
        const a = trs[2].querySelector('a')
        info.url = a.href
        info.name = a.textContent
        info.hash = a.href.split('/').pop().split('.').shift()
        return info
      } catch (e) {
        return null
      }
    })
    .filter((v) => v)
  return list
}

/**
 * @param { string } str
 */
function getKV(str) {
  return str
    .replace(/:/, '=')
    .split('=')
    .map((v) => v.trim())
}

module.exports = {
  parseGalleryList,
  parseHTMLAnchorElement,
  parseDetailPageList,
  parseDetailPageCommentList,
  parseDetailPageTagList,
  parseDetailPageInfo,
  parseBigImg,
  parseTorrentList,
}
