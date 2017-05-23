var express = require('express')
var app = express()

var port = 3000

//JSON body support
var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Load app routes
app.use(express.static('public'))
require('./routing')(app)

app.listen(port, function () {
	console.log('App started listening on port ' + port)
})