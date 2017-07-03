var db = require('./database')
var crypto = require('crypto')

module.exports = {
	create: function(params, callback) {
		this.save(params, false, function(data) {
			callback(data)
		})
	},
	
	save: function(params, update, callback) {
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
		
		if(!update) {
			db.User.create(params).then(user => {
				callback({ user: user })
				
			}).catch(function (err) {
				callback({ err: "User is already registered" })
			})
			
		} else {			
			this.read(params.name, function(user) {
				params.oldPass = encryptPass(params.name, params.oldPass)
				
				if(params.oldPass != user.pass) {
					callback({ err: "Old password is incorrect" })
					return
				}
				
				user.updateAttributes(params).then(function() {
					callback({ })
				})
			})
		}
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
	
	changePass: function(params, callback) {
		var session = this.getSession(params.token)
		
		this.save({ name: session.name, oldPass: params.oldPass, pass: params.newPass }, true, function(data) { callback(data) })
	},
	
	checkLogin: function(params, callback) {
		params.name = params.name.toLowerCase()
		var pass = encryptPass(params.name, params.pass)
		
		this.read(params.name, function(user) {
			callback({ success: user != null && user.pass == pass, user: user })
		})
	},
	
	createGenericSession: function(req) {
		req.session.token = req.session.id
		
		this.store[req.session.token] = req.session
	},
	
	createSession: function(req, params, id) {
		req.session.name = params.name
		req.session.userId = id
		req.session.token = req.session.id
		
		this.store[req.session.token] = req.session
	},
	
	getSession: function(token) {
		return this.store[token]
	}
}

module.exports.store = {}

function encryptPass(salt, pass) {
	var secret = "42069schermutselinggezegevierd"
	
	return crypto.createHash('md5').update(salt + secret + pass).digest('hex')
}