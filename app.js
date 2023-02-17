const express = require('express');
const bodyParser = require("body-parser")
const dotenv = require('dotenv')
const Sequelize = require("sequelize");
const {DataTypes} = require("sequelize");
const {generateAccessToken,authenticateToken} = require('./jwt-authentication')

dotenv.config()

// mysql database connection
const sequelize = new Sequelize(
    'users',
    process.env.USER,
    process.env.PASSWORD,
    {
        host: 'localhost',
        dialect: 'mysql'
    }
);

// database authentication
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database:', error)
})

const User = sequelize.define("users", {
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

sequelize.sync().then(() => {
    console.log('Users table created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});


const app = express();

app.use(bodyParser.urlencoded({extended: true}))

// register endpoint
app.post('/register', async function (req, res) {
    const email = req.body.email
    const password = req.body.password

    const user = await User.create({
        email: email,
        password: password
    })

    if (user.email !== null && user.password !== null){
        const token = generateAccessToken(user.email)
        res.json(token)
    }
})

app.post('/login', authenticateToken, async function (req, res) {
    const email = req.body.email
    const password = req.body.password

    const user = await User.findOne({where: {email: email, password: password}})
    if (user === null) {
        res.send('User not found')
    } else {
        res.send("successfully logged in")
    }
})


app.get('logout', function (req, res) {
    res.logout()
    req.session = null
    res.redirect('/login')
})


app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port 3000")
})
