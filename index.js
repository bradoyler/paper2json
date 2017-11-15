const archieml = require('archieml')
const htmlparser = require('htmlparser2')
const { AllHtmlEntities } = require('html-entities')
const Dropbox = require('dropbox')

function parseHTML (doc) {
  // encode fileBinary
  const docHTML = Buffer.from(doc.fileBinary, 'binary').toString('utf8')
    .replace(/span>\s<span/g, 'span><span> </span><span') // paper hack

  const dom = htmlparser.parseDOM(docHTML)

  const tagHandlers = {
    _base: (tag) => {
      let str = ''
      if (Array.isArray(tag.children)) {
        tag.children.forEach(function (child) {
          const transform = tagHandlers[child.name || child.type]
          if (transform) {
            str += transform(child)
          }
        })
      }
      return str
    },
    text: (textTag) => {
      if (textTag.data) {
        // replace token logic (for auto-links)
        textTag.data = textTag.data.replace('{://}', '://')
      }
      return textTag.data
    },
    span: (spanTag) => tagHandlers._base(spanTag),
    b: (tag) => `<strong>${tagHandlers._base(tag)}</strong>`,
    s: (tag) => `<s>${tagHandlers._base(tag)}</s>`,
    p: (pTag) => `${tagHandlers._base(pTag)}\n`,
    a: (aTag) => {
      const { href } = aTag.attribs
      if (href === undefined) return ''
      return `<a href="${href}">${tagHandlers._base(aTag)}</a>`
    },
    li: (tag) => `* ${tagHandlers._base(tag)}\n`
  }

  const listTags = ['ul', 'ol']
  listTags.forEach((tag) => {
    tagHandlers[tag] = tagHandlers.span
  })

  const hTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  hTags.forEach((tag) => {
    tagHandlers[tag] = tagHandlers.p
  })

  const tagArray = dom.map(nodes => {
    if (Array.isArray(nodes.children) && Array.isArray(nodes.children[0].children)) {
      let strTag = ''
      for (var i = 0; i < nodes.children.length; i++) {
        const tag = tagHandlers._base(nodes.children[i])
        strTag += tag
      }
      return strTag
    }
  })

  const parsedText = tagArray.join('\n')
  // Convert html entities into the characters as they exist in the paper doc
  const entities = new AllHtmlEntities()
  const decodedText = entities.decode(parsedText)
  // replace chars - ”
  const cleanText = decodedText
    .replace(/“/g, '"').replace(/”/g, '"').replace(/-/g, '-')
  return archieml.load(cleanText)
}

function getDoc (docId, accessToken, format = 'html') {
  const dbx = new Dropbox({ accessToken })
  return dbx.paperDocsDownload({ doc_id: docId, export_format: format })
}

module.exports = function (docId, accessToken) {
  return getDoc(docId, accessToken)
  .then(parseHTML)
}

module.exports.parseHTML = parseHTML // for testing
module.exports.getDoc = getDoc
