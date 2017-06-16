var db = require('./database')
var crypto = require('crypto')

module.exports = {
	create: function(params, callback) {
		this.save(params, function(err, user) {
			callback(err, user)
		})
	},
	
	save: function(params, callback) {
		var minPassLength = 4;
		
		//Validation
		if(typeof(params.name) == 'undefined' || typeof(params.pass) == 'undefined') {
			callback({ err: "Error 403: Hacking is not cool!" })
			return;
		}
		
		if(params.pass.length < minPassLength) {
			callback({ err: "Password must be at least " + minPassLength + " long" })
			return;
		}
		
		//Hash password
		params.name = params.name.toLowerCase()
		params.pass = encryptPass(params.name, params.pass)
		
		db.User.create(params).then(user => {
			callback({ user: user })
			
		}).catch(function (err) {
			callback({ err: "User is already registered" })
		})
	},
	
	read: function(name, callback) {
		db.User.findOne({
			where: {
				name: name
			}
		}).then(user => {
			callback(user)
		})
	},
	
	checkLogin: function(params, callback) {
		params.name = params.name.toLowerCase()
		var pass = encryptPass(params.name, params.pass)
		
		this.read(params.name, function(user) {
			callback(user != null && user.pass == pass)
		})
	},
	
	createSession: function(req, params) {
		req.session.name = params.name
	}
}

function encryptPass(salt, pass) {
	var secret = "42069schermutselinggezegevierd"
	
	return crypto.createHash('md5').update(salt + secret + pass).digest('hex')
}