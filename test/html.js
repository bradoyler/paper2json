const Dropbox = require('dropbox')
const docId = 'S7sSIlM2E0g6p3OXhhts4'
const accessToken = process.env.ACCESS_TOKEN

const dbx = new Dropbox({ accessToken })

dbx.paperDocsDownload({ doc_id: docId, export_format: 'html' })
.then((doc) => {
  const html = Buffer.from(doc.fileBinary, 'binary').toString()
  if (html.indexOf('â') > -1) {
    console.log('!!! response contains â character')
  } else {
    console.log(html, 'all good!')
  }
})
