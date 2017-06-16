var express = require('express')
var app = express()
var session = require('express-session')

var port = 3000

//JSON body support
var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


//Cookies
app.set('trust proxy', 1)
app.use(session({
  secret: 'kaaskrocket',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

//Load app routes
app.use(express.static('public'))
require('./routing')(app)

app.listen(port, function () {
	console.log('App started listening on port ' + port)
})