const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const{APIKEY} = require('../config/config');
const sgMail = require('@sendgrid/mail');
const querystring = require('querystring');
sgMail.setApiKey(APIKEY);
const jwt = require('jsonwebtoken');
const accessTokenSecret = 'youraccesstokensecret';
const refreshTokenSecret = 'yourrefreshtokensecrethere';
const refreshTokens = [];


// Directory Paths
const directorio_partials = path.join(__dirname, './../templates/partials');
const directorio_views = path.join(__dirname, './../templates/views');

// HBS
hbs.registerPartials(directorio_partials);
app.set('views',directorio_views);
app.set('view engine', 'hbs');//Le configuramos el motor de templates o de vistas


// Models mongodb
const User = require('../models/user');
const Equipment = require('../models/equipment');
const Borrow = require('../models/borrow');

// Paths
app.get('/', (req, res) =>{	
	res.render ('landing',{

	})
});

app.get('/error', (req, res) =>{	
	res.render ('error',{
	})
});

app.get('/login', (req, res) =>{
  	res.render('login', {
		title: 'login' 
	})
});

app.post('/login', (req, res) =>{
    User.findOne({email : req.body.inputEmail}, (err,result)=>{
			if(err){
				console.log(err)
				res.render('login', {
								registro: req.body.registro,
								show: "Error"
				})
			}
			if(!result){
				res.render('login', {
					login: req.body.login,
					show: "Usuario o contraseña incorrectas",
					path: "/login",
					button: "danger"
				})
			}
			if(result && !bcrypt.compareSync(req.body.inputPassword, result.password)){
				res.render('login', {
					login: req.body.login,
					show: "Usuario o contraseña incorrectas",
					path: "/login",
					button: "danger"
				})
			}
			if(result && bcrypt.compareSync(req.body.inputPassword, result.password) && result.roll == "coordinador"){
				// session variables
				req.session.user = result._id
				req.session.roll = result.roll
				req.session.firstname = result.firstname
				req.session.lastname = result.lastname
				req.session.email = result.email
				req.session.cc = result.cc
				req.session.phone = result.phone
				req.session.coordinador = true
				if(result.avatar){
					req.session.avatar = result.avatar.toString('base64')
				}
				//jwt
				const accessToken = jwt.sign({ user: result._id, role: result.roll }, accessTokenSecret, { expiresIn: '20m' });
				const refreshToken = jwt.sign({ user: result._id, role: result.roll }, refreshTokenSecret);
				refreshTokens.push(refreshToken);
				
				data = { accessToken,refreshToken }

				/* res.redirect('/dashboardadmin?' + querystring.stringify(data)) */
				res.redirect('/dashboardadmin')
				
			}
			if(result && bcrypt.compareSync(req.body.inputPassword, result.password) && result.roll == "usuario"){
				// session variables
				req.session.user = result._id
				req.session.roll = result.roll
				req.session.firstname = result.firstname
				req.session.lastname = result.lastname
				req.session.email = result.email
				req.session.cc = result.cc
				req.session.phone = result.phone
				if(result.avatar){
					req.session.avatar = result.avatar.toString('base64')
				}
				res.redirect('/dashboarduser')
			}
			if(result && bcrypt.compareSync(req.body.inputPassword, result.password) && result.roll == "profesor"){
				// session variables
				req.session.user = result._id
				req.session.roll = result.roll
				req.session.firstname = result.firstname
				req.session.lastname = result.lastname
				req.session.email = result.email
				req.session.cc = result.cc
				req.session.phone = result.phone
				if(result.avatar){
					req.session.avatar = result.avatar.toString('base64')
				}

				 res.render('dashboardteacher', {
					roll: req.session.roll,
				})
			}
		})
});

app.get('/register', (req, res) =>{
  	res.render('register', {
	})
});

app.post('/register', (req, res) =>{
	let user = new User({
		firstname: req.body.firstName,
		lastname: req.body.lastName,
		email: req.body.inputEmail,
		password: bcrypt.hashSync(req.body.inputPassword, 10),
		phone: req.body.phone,
		cc: req.body.cedula,
		roll: "usuario",
		cursos: []
	})
	user.save((err,result)=>{
		if(err){
			console.log(err);
			res.render('register', {
				show: "Upss! El usuario con ese email o cedula ya existe intenta de nuevo."
			})
		}if(result){
		    const mailmsg = {
				to: req.body.inputEmail,
				from: 'edwardca12@gmail.com',
				subject: 'Bienvenido a mi app!',
				text: 'Hola, bienvenido a mi aplicacion web, estamos en construccion.',
				html: `<h1> Hola ${req.body.firstName}!, bienvenido a mi aplicación web, estamos en construcción.<h1> <br> <strong>pronto mucho más! esperanos.</strong>`,
			};
			sgMail.send(mailmsg)
			res.render('register',{
				registro: req.body.registro,
				show: "<a href='/loginregister'>Registro exitoso! ya puedes ingresar </a>"
			})
		}		
	})
});



module.exports = app;
