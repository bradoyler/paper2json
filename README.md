# Paper2JSON  
 In summary, the coolest thing ever.  
 Also converts a Dropbox paper document to JSON using [ArchieML](http://archieml.org/).

Sister project to [Googledoc-to-json](https://github.com/bradoyler/googledoc-to-json)

## CLI Usage  
```
$ npx paper2json <Dropbox docId> -t <Dropbox Access Token>
// will output aml.json (default)
```

## API
```javascript
const fs = require('fs')
const paper2json = require('paper2json')
paper2json(docId, accessToken)
  .then(aml => fs.writeFileSync('test/aml.json', JSON.stringify(aml, null, '\t')))

```

---
Get a damn access token  [by reading this...](https://blogs.dropbox.com/developers/2014/05/generate-an-access-token-for-your-own-account/)
