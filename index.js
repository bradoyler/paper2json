const archieml = require('archieml')
const htmlparser = require('htmlparser2')
const { AllHtmlEntities } = require('html-entities')
const url = require('url')
const Dropbox = require('dropbox')

function parseHTML (doc) {
  // remove corrupt html
  const docHTML = doc.fileBinary
  .replace(/<\/span><span> <\/span><span>â..<\/span><span> /g, ' - ')
  const dom = htmlparser.parseDOM(docHTML)

  const tagHandlers = {
    _base: (tag) => {
      let str = ''
      tag.children.forEach(function (child) {
        const transform = tagHandlers[child.name || child.type]
        if (transform) {
          str += transform(child)
        }
      })
      return str
    },
    text: (textTag) => {
      return textTag.data
    },
    span: (spanTag) => {
      return tagHandlers._base(spanTag)
    },
    p: (pTag) => {
      return tagHandlers._base(pTag) + '\n'
    },
    a: (aTag) => {
      let { href } = aTag.attribs
      if (href === undefined) return ''

      let str = '<a href="' + href + '">'
      str += tagHandlers._base(aTag)
      str += '</a>'
      return str
    },
    li: (tag) => {
      return '* ' + tagHandlers._base(tag) + '\n'
    }
  }

  const listTags = ['ul', 'ol']
  listTags.forEach((tag) => {
    tagHandlers[tag] = tagHandlers.span
  })

  const hTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  hTags.forEach((tag) => {
    tagHandlers[tag] = tagHandlers.p
  })

  const tagArray = dom.map(function (nodes) {
    if (Array.isArray(nodes.children) && Array.isArray(nodes.children[0].children)) {
      return tagHandlers._base(nodes.children[0])
    }
  })

  const parsedText = tagArray.join('\n')

  // Convert html entities into the characters as they exist in the paper doc
  const entities = new AllHtmlEntities()
  const decodedText = entities.decode(parsedText)

  // Remove smart quotes from inside tags
  const cleanText = decodedText
  .replace(/<[^<>]*>/g, (match) => {
    return match.replace(/â/g, '\"')
  }).replace(/:Â/g, ':') // remove empty symbols: Â

  return archieml.load(cleanText)
}

function getHTML (docId, accessToken) {
  const dbx = new Dropbox({ accessToken })
  return dbx.paperDocsDownload({ doc_id: docId, export_format: 'html' })
}

module.exports = function (docId, accessToken) {
  return getHTML(docId, accessToken)
  .then(parseHTML)
  .catch(console.error)
}

module.exports.parseHTML = parseHTML // for testing
module.exports.getHTML = getHTML
