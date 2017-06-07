const Sequelize = require('sequelize')
const sequelize = new Sequelize('mysql://root@localhost:3306/meemr') // mysql://user:pass@localhost:3306/dbname

module.exports = {
	Post: sequelize.define('post', {
		title: Sequelize.STRING
	}),

	User: sequelize.define('user', {
		name: { type: Sequelize.STRING, unique: true },
		pass: Sequelize.STRING
	})
};

sequelize.sync().then(() => {
	console.log("Database loaded")	
})
