const archieml = require('archieml')
const htmlparser = require('htmlparser2')
const { AllHtmlEntities } = require('html-entities')
const url = require('url')
const Dropbox = require('dropbox')

function parseHTML (doc) {
  const dom = htmlparser.parseDOM(doc.fileBinary)

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
      // extract real URLs from Google's tracking
      // from: http://www.google.com/url?q=http%3A%2F%2Fwww.nytimes.com...
      // to: http://www.nytimes.com...
      if (aTag.attribs.href && url.parse(aTag.attribs.href, true).query && url.parse(aTag.attribs.href, true).query.q) {
        href = url.parse(aTag.attribs.href, true).query.q
      }

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
  const cleanText = decodedText.replace(/<[^<>]*>/g, (match) => {
    return match.replace(/”|“/g, '"').replace(/‘|’/g, "'")
  }).replace(/:Â/g, ':') // remove empty symbols: Â

  return archieml.load(cleanText)
}

module.exports = function (docId, accessToken) {
  const dbx = new Dropbox({ accessToken })
  return dbx.paperDocsDownload({ doc_id: docId, export_format: 'html' })
  .then(debug)
  .then(parseHTML)
  .catch(console.error)
}

// for testing purposes
function debug (doc) {
  if (process.env.DEBUG === 'true') {
    console.log(doc)
  }
  return doc
}

module.exports.parseHTML = parseHTML // for testing
