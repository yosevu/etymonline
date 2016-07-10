const cheerio = require('cheerio')
const glob = require('glob')
const fs = require('fs')
const sortby = require('lodash.sortby')
const path = require('path')
const omitEmpty = require('omit-empty')

var words = []

glob("pages/*.html", function (err, files) {
  if (err) throw err
  files.forEach(file => {
    var $ = cheerio.load(fs.readFileSync(file, 'utf8'))
    $('dt').each(function() {
      var word = {}
      var entry = $(this).find('a').text().match(/(.*) \((\w+)\.\)/)
      if (entry) {
        word.word = entry[1]
        word.pos = entry[2]
      } else {
        word.word = $(this).text().trim()
      }

      var $etym = $(this).next('dd')

      word.crossreferences = $etym.find('a.crossreference').map(function(){
        return $(this).text().trim()
      }).get()

      word.quotes = $etym.find('blockquote').map(function(){
        return $(this).text().trim()
      }).get()

      // remove blockquotes from
      $etym.find('blockquote').remove()

      word.etymology = $etym.text().trim()
      word.years = (word.etymology.match(/(\d{4})/g) || []).map(Number).sort()
      words.push(omitEmpty(word))
      process.stderr.write('.')
    })
  })

  words = sortby(words, 'word')
  process.stdout.write(JSON.stringify(words, null, 2))
  process.exit()
})
