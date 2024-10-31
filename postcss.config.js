module.exports = {
  plugins: [
    require('postcss-import'),
    require('./lib/index.js')({})
  ]
}
