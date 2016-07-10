const async = require('async')
const get = require('got')
const fs = require('fs')
const path = require('path')
const URL = require('url')
const RateLimiter = require('limiter').RateLimiter
const limiter = new RateLimiter(1, 500)  // 1 request per 500ms
const exists = require('path-exists').sync
const counts = require('./letters.json')

var urls = []

Object.keys(counts).forEach(letter => {
  for (i=0; i<counts[letter]; i++) {
    urls.push(`http://www.etymonline.com/index.php?l=${letter}&p=${i}`)
  }
})

async.map(
  urls,

  function (url, callback) {
    limiter.removeTokens(1, function () {
      var query = URL.parse(url, true).query
      var filename = path.join(__dirname, 'pages', `${query.l}-${query.p}.html`)
      get(url).then(function(res){
        if (exists(filename)) {
          console.log(`${filename} (exists)`)
        } else {
          console.log(`${filename}`)
          fs.writeFileSync(filename, res.body)
        }
        return callback(null)
      })
    })
  },

  function (err) {
    if (err) throw err
    process.exit()
  }
)
