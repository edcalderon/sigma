const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Directory Paths
const directorio_partials = path.join(__dirname, './../templates/partials');
const directorio_views = path.join(__dirname, './../templates/views');

// HBS
hbs.registerPartials(directorio_partials);
app.set('views',directorio_views);
app.set('view engine', 'hbs');//Le configuramos el motor de templates o de vistas


// Models mongodb
const User = require('../models/user');

// Session
app.use(session({
	secret: "keyboard cat",
	resave: false,
	saveUninitialized: true
}))

// Paths
app.get('/', (req, res) =>{	
	res.render ('landing',{

	})
});

app.get('/loginregister', (req, res) =>{
  	res.render('loginregister', {
	})
});

app.post('/loginregister', (req, res) =>{
    User.findOne({email : req.body.inputEmail}, (err,result)=>{
			if(err){
				console.log(err)
				res.render('loginregister', {
								registro: req.body.registro,
								show: "Error"
				})
			}
			if(!result){
				res.render('loginregister', {
					login: req.body.login,
					show: "Usuario o contraseña incorrectas",
					path: "/loginregister",
					button: "danger"
				})
			}
			if(result && !bcrypt.compareSync(req.body.inputPassword, result.password)){
				res.render('loginregister', {
					login: req.body.login,
					show: "Usuario o contraseña incorrectas",
					path: "/loginregister",
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
				res.render('dashboardadmin', {
					coordinador: req.session.coordinador,
					roll: req.session.roll,
					avatar: req.session.avatar,
					email: req.session.email,
					session: req.session.user,
				})
			}
			if(result && bcrypt.compareSync(req.body.inputPassword, result.password) && result.roll == "aspirante"){
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

				res.render('loginregister', {
					login: req.body.login,
					show: "Usuario y Contraseña correctas! ya puedes continuar.",
					path: "/dashboarduser",
					button: "success",
				})
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

				 res.render('loginregister', {
					login: req.body.login,
					show: "Bienvenido profesor",
					path: "/dashboardteacher",
					button: "success",
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
		roll: "aspirante",
		cursos: []
	})
	user.save((err,result)=>{
		if(err){
			console.log(err);
						res.render('register', {
							registro: req.body.registro,
							show: "Upss! el usuario con ese email o cedula ya existe"
						})
		}
		const mailmsg = {
		  to: req.body.inputEmail,
		  from: 'edwardca12@gmail.com',
		  subject: 'Bienvenido a mi app!',
		  text: 'Hola, bienvenido a mi aplicacion web, estamos en construccion.',
		  html: `<h1> Hola ${req.body.firstName}!, bienvenido a mi aplicación web, estamos en construcción.<h1> <br> <strong>pronto mucho más! esperanos.</strong>`,
		};
        // send mail
		sgMail.send(mailmsg)

		res.render('register',{
			registro: req.body.registro,
			show: "<a href='/loginregister' >Registro exitoso! ya puedes ingresar </a>"
		})
	})
});



module.exports = app;
