const expect = require('chai').expect

module.exports = function (code, message) {
  return function (response) {
    expect(response.status).to.equal(code)
    if (message) {
      expect(response.body.code).to.equal(message)
    }
  }
}
