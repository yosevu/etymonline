const async = require('async')
const get = require('got')
const cheerio = require('cheerio')
const alphabet = require('alphabet').lower
const RateLimiter = require('limiter').RateLimiter
const limiter = new RateLimiter(1, 500) // 1 request per 500ms

var counts = {}

async.map(
  alphabet,

  function (letter, callback) {
    limiter.removeTokens(1, function () {
      var url = `http://www.etymonline.com/index.php?l=${letter}`
      get(url).then(function(res){
        return callback(null, {letter: letter, body: res.body})
      })
    })
  },

  function (err, pages) {
    if (err) return callback(err)

    pages.forEach(page => {
      var $ = cheerio.load(page.body)
      counts[page.letter] = Number($('.paging:first-child li:last-child a').text())
    })

    process.stdout.write(JSON.stringify(counts, null, 2))
    process.exit()
  }
)
