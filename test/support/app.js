'use strict'

const app = require('express')()

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const chai = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

// dynamic route support for testing. inspired by:
// https://github.com/expressjs/express/issues/2596#issuecomment-81353034
var authorizer = null

function setAuthorizer (_authorizer) {
  authorizer = _authorizer
}

app.use(function (req, res, next) {
  authorizer.handle(req, res)
})

exports.app = app
exports.setAuthorizer = setAuthorizer
