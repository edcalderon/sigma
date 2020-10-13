//Requires
require('../config/config');
require('../helpers/helpers');
//global + constants
const{APIKEY} = require('../config/config');
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(APIKEY);
//var $ = require("jquery");

// Models mongodb
const User = require('../models/user');
const Course = require('../models/course');
const Equipment = require('../models/equipment');
const Borrow = require('../models/borrow');
const { mapReduce } = require('../models/user');

// Directory Paths
const directorio_partials = path.join(__dirname, './../templates/partials');
const directorio_views = path.join(__dirname, './../templates/views');

// HBS
hbs.registerPartials(directorio_partials);
app.set('views',directorio_views);
app.set('view engine', 'hbs');//Le configuramos el motor de templates o de vistas

// Session
app.use(session({
	secret: "keyboard cat",
	resave: true,
	saveUninitialized: true,
	cookie: {
		maxAge: 24 * 60 * 60 * 365 * 1000
	}
}))

app.get('/dashboarduser', (req, res) =>{
	//lista de cursos inscritos
	Course.find({students: { $elemMatch: {cedula:req.session.cc,nombre:req.session.firstname}}},(err,result)=>{
		if (err){
			return console.log(err)
		}
		count = 0;
		result.forEach(curso => {
			count = count + curso.value
		})
		console.log('la cuenta: ' +   count)
		console.log('mi resultado: '+result)
		req.session.miscursos = result;
		req.session.valorCursosInscritos = count;
	})

	//Cantidad de cursos Inscritos
	Course.countDocuments({students: { $elemMatch: {cedula:req.session.cc,nombre:req.session.firstname}}}, (err,result) => {
		if(err){
			console.log(err)
		}
		console.log('cursos?: ' + result)
		req.session.cursosInscritos = result;
	})

	//Cantidad de cursos disponibles
	Course.countDocuments({state: "Disponible"},(err,result)=>{
		if(err){
			console.log(err)
		}
		console.log('CursosDisponibles: ' + result)
		req.session.cursosDisponibles = result;
	})

	//listar cursos disponibles
	Course.find({state: "Disponible"},(err,result)=>{
		if (err){
			return console.log(err)
		}
		req.session.listado = result;
		req.session.verCursosDisponibles = req.query.verCursosDisponibles;
		res.render ('dashboarduser',{
			listado : req.session.listado,
			verCursosDisponibles : req.session.verCursosDisponibles,
			miscursos: req.session.miscursos,
			cantidadCursosInscritos: req.session.cursosInscritos,
			cantidadCursosDisponibles: req.session.cursosDisponibles,
			valorCursosInscritos: req.session.valorCursosInscritos
		})
	})
});

app.post('/dashboarduser', (req, res) =>{
//Validación
var conditions = {
	name: req.body.inscribir,
	students: { $elemMatch: {cedula:req.session.cc,nombre:req.session.firstname}}
};

Course.find(conditions,(err,result)=>{
		if (err){
			return console.log(err)
		}
		console.log('LOS RESULTADOS SON:')
		console.log(req.session.user)
		console.log(result)
		console.log(result.length)
		if(result.length == 0 && req.body.inscribir){
				//********************* Actualización*****
				console.log('Te inscribiste correctamente!!!!')
						Course.findOneAndUpdate({name: req.body.inscribir},{$addToSet:{students: {cedula:req.session.cc, nombre:req.session.firstname,apellido: req.session.lastname , email: req.session.email, phone: req.session.phone}}}, (err, curso) =>{
							console.log('RESULTADOS DEL POST')
							console.log(req.body.inscribir);
							console.log(curso)
							if (err){
								return res.render('dashboarduser',{
								  resultshow: "Hubo un error: " + err,
								  cardcolor: "danger"
							 })
							}
							res.render ('dashboarduser', {
								listado: req.session.listado,
								name: curso.name,
								description: curso.description,
								value: curso.value,
								intensity: curso.intensity,
								modality: curso.modality,
								state: curso.state,
								students: req.session.user,
								resultshow: "¡Se inscribió exitosamente en el curso " + curso.name + "!",
								cardcolor: "success"
							})
						})
		}
		if(result.length !== 0 && req.body.inscribir){
			return res.render('dashboarduser',{
				resultshow: "Upss! Actualmente estas inscrito",
				cardcolor: "warning"
			})
		}
	});
	if(req.body.eliminar){
		console.log('Si se metio')
		var conditions = {
			name: req.body.eliminar,
			students: { $elemMatch: {cedula:req.session.cc,nombre:req.session.firstname}}
		};
		Course.findOneAndUpdate(conditions,{$pull:{students: {cedula:req.session.cc, nombre:req.session.firstname,apellido: req.session.lastname , email: req.session.email, phone: req.session.phone}}},(err,result)=>{
			if (err){
				return res.render('dashboarduser',{
					resultshow3: "Hubo un error: " + err,
					cardcolor3: "danger"
			 })
			}
			console.log('resultado eliminacion: ' + result)
			res.render ('dashboarduser', {
				listado: req.session.listado,
				name: result.name,
				description: result.description,
				value: result.value,
				intensity: result.intensity,
				modality: result.modality,
				state: result.state,
				students: req.session.user,
				miscursos: req.session.miscursos,
				resultshow3: "Haz cancelado la materia: " + result.name,
				cardcolor3: "success"
			})

		})
	}
});

app.get('/dashboardadmin', (req, res) =>{
	Equipment.find({},(err,result)=>{
		if (err){
			return res.render('dashboardadmin',{
				resultshow2: "Hubo un error: " + err,
				cardcolor2: "danger"
		 })
		}
		req.session.equipments = result
		res.render ('dashboardadmin',{
			equipmentsList: req.session.equipments,
			courses : req.session.courses,
			verCursosDisponibles : req.session.verCursosDisponibles,
			misusuarios: req.session.misusuarios,
			verUsuarios: req.session.verUsuarios,
			data: req.session.datos,
			cantidadCursosDisponibles: req.session.cursosDisponibles,
			cursosCerrados: req.session.cursosCerrados,
			ganancia: req.session.ganancia,
			coordinador: req.session.coordinador
		})
	})
});

app.post('/dashboardadmin', (req, res) =>{
	// Guardar cursos

		//Cerrar curso
		if(req.body.cerrar){
				//listado de docentes
				User.find({roll: "profesor"},(err,result)=>{
					if (err){
						return console.log(err)
					}
					req.session.teachers = result;
				})
			 //Actualizar estado
				 Course.findOneAndUpdate({name: req.body.cerrar}, {$set: {state: "Cerrado"}},{new: true},(err, resultado) => {
			 		if (err){
			 			return console.log(err)
			 		}
			 		res.render ('dashboardadmin', {
						courses : req.session.courses,
						verCursosDisponibles : req.session.verCursosDisponibles,
						name: resultado.name,
						description: resultado.description,
						value: resultado.value,
						intensity: resultado.intensity,
						modality: resultado.modality,
						state: resultado.state,
						students: resultado.students,
						teachers: req.session.teachers,
						asigna: req.body.asigna,
						path:'/dashboardadmin',
						resultshow2: "El curso "+resultado.name+" ha cerrado correctamente ",
						cardcolor2: "success"
			 		})
			 	})

				if(req.body.profesor){
						User.findOneAndUpdate({cc: req.body.profesor},{$addToSet: {cursos: req.body.cerrar}},{new: true},(err,result)=>{
							if (err){
					 			return console.log(err)
					 		}
							console.log('select: ' + req.body.profesor)
							console.log('si funciona: ' + result)
						})
					}else{
						console.log('select: ' + req.body.profesor)
						console.log('form: ' + req.body.myform)
						console.log('no pasa nada')
					}
		}
		if(req.body.abrir){
		 //Actualizar estado
			 Course.findOneAndUpdate({name: req.body.abrir}, {$set: {state: "Disponible"}},{new: true} ,(err, resultado) => {
				if (err){
					return console.log(err)
				}
				console.log(resultado)
				res.render ('dashboardadmin', {
					courses : req.session.courses,
					verCursosDisponibles : req.session.verCursosDisponibles,
					name: resultado.name,
					description: resultado.description,
					value: resultado.value,
					intensity: resultado.intensity,
					modality: resultado.modality,
					state: resultado.state,
					students: resultado.students,
					resultshow2: "El curso "+resultado.name+" ha abierto correctamente " ,
					cardcolor2: "success"
				})
			})
		}
		//Actualizar usuario
		if(req.body.modificar){

			User.findOne({_id: req.body.modificar},(err,result)=>{
				if (err){
					 return console.log(err)
		 		}
				var obj = result.toObject()
				console.log(obj)

        //set session vars
				req.session.modificar = req.body.modificar
				req.session.idUser = obj._id,
				req.session.cursosUser = obj.cursos
				req.session.firstnameUser =  obj.firstname
				req.session.lastnameUser = obj.lastname
				req.session.emailUser =  obj.email
				req.session.passwordUser = obj.password
				req.session.phoneUser = obj.phone
				req.session.ccUser = obj.cc
				req.session.rollUser = obj.roll

				res.render('dashboardupdateuser',{
					firstnameUser :  req.session.firstnameUser,
					lastnameUser : req.session.lastnameUser,
					emailUser :  req.session.emailUser,
					phoneUser : req.session.phoneUser,
					ccUser : req.session.ccUser,
					rollUser : req.session.rollUser
				})
			})
		}
});
app.get('/custompage', (req, res) =>{
	res.render('custompage')
})

app.get('/createitem', (req, res) =>{
	console.log(req.session.coordinador)
	console.log(req.session.user)
	res.render('dashboardcreateitem',{
		coordinador: req.session.coordinador,
	})
});

/*app.post('/createitem', (req, res) =>{
	res.render('dashboardcreateitem',{
		coordinador: req.session.coordinador,
	})
});*/

app.post('/dashboardcreateitem', (req, res) => {
	let equipment = new Equipment({
		category: "portatil",
		status: req.body.status,
		equipmentId: req.body.equipmentId,
		monitorId: req.body.monitorId,
		equipmentRef: req.body.equipmentRef,
		monitorRef: req.body.monitorRef,
		memoryRam: req.body.memoryRam,
		diskRef: req.body.diskRef,
		diskSpace: req.body.diskSpace,
		processor: req.body.processor,
		mouse: req.body.mouse,
		keyboard: req.body.keyboard,
		OS: req.body.os,
		licenseOS: req.body.osLicense,
		officeVersion: req.body.officeVersion,
		officeLicense: req.body.officeLicense,
		observation: req.body.observation,
		diagnostic: req.body.diagnostic,
		recommendation: req.body.recommendation
	});
	console.log(equipment)
	equipment.save((err, result) => {
		if (err) {
			req.session.category = "portatil";
			req.session.status = req.body.status;
			req.session.equipmentId = req.body.equipmentId;
			req.session.monitorId = req.body.monitorId;
			req.session.equipmentRef = req.body.equipmentRef;
			req.session.monitorRef = req.body.monitorRef;
			req.session.memoryRam = req.body.memoryRam;
			req.session.diskRef = req.body.diskRef;
			req.session.diskSpace = req.body.diskSpace;
			req.session.processor = req.body.processor;
			req.session.mouse = req.body.mouse;
			req.session.keyboard = req.body.keyboard;
			req.session.os = req.body.os;
			req.session.licenseOS = req.body.osLicense;
			req.session.officeVersion = req.body.officeVersion;
			req.session.officeLicense = req.body.officeLicense;
			req.session.observation = req.body.observation;
			req.session.diagnostic = req.body.diagnostic;
			req.session.recommendation = req.body.recommendation;

			res.render('dashboardcreateitem', {
				error: "Un error",
				category: "portatil",
				status: req.session.status,
				equipmentId: req.session.equipmentId,
				monitorId: req.session.monitorId,
				equipmentRef: req.session.equipmentRef,
				monitorRef: req.session.monitorRef,
				memoryRam: req.session.memoryRam,
				diskRef: req.session.diskRef,
				diskSpace: req.session.diskSpace,
				processor: req.session.processor,
				mouse: req.session.mouse,
				keyboard: req.session.keyboard,
				OS: req.session.os,
				licenseOS: req.session.osLicense,
				officeVersion: req.session.officeVersion,
				officeLicense: req.session.officeLicense,
				observation: req.session.observation,
				diagnostic: req.session.diagnostic,
				recommendation: req.session.recommendation
			});
			console.log(err);
			return;
		} else {
			res.render('dashboardcreateitem',{
				message : 'un mensaje'
			});
			console.log("¡Se registro el equipo!")
			console.log(result)
		}
	});
})

app.get('/dashboardequipment', (req, res) =>{
	req.session.equipmentId = req.query.id; /*Tener cuidado con esto*/ 
	Equipment.findOne({equipmentId: req.query.id}, (err, result)=>{
		if (err){
 
		}if(result){
			res.render ('dashboardequipment',{
				category: result.category,
				equipmentId: result.equipmentId,
				monitorId: result.monitorId,
				equipmentRef: result.equipmentRef,
				monitorRef: result.monitorRef,
				memoryRam:  result.memoryRam,
				diskRef:  result.diskRef,
				diskSpace:  result.diskSpace,
				processor: result.processor,
				mouse:  result.mouse,
				keyboard:  result.keyboard,
				OS:  result.OS,
				licenseOS:  result.licenseOS,
				officeVersion:  result.officeVersion,
				officeLicense:  result.officeLicense,
				observation:  result.observation,
				diagnostic:  result.diagnostic,
				recommendation: result.recommendation
			})
		}
	})		 
});

app.post('/dashboardequipment', (req, res) =>{
	var conditions = {};
	if(req.body.equipmentId){ Object.assign(conditions, {equipmentId : req.body.equipmentId}) }
	if(req.body.equipmentRef){ Object.assign(conditions, {equipmentRef: req.body.equipmentRef}) }
	if(req.body.monitorId){ Object.assign(conditions, {monitorId : req.body.monitorId}) }
	if(req.body.monitorRef){ Object.assign(conditions, {mmonitorRef : req.body.monitorRef}) }
	if(req.body.memoryRam){ Object.assign(conditions, {memoryRam : req.body.memoryRam}) }
	if(req.body.diskRef){ Object.assign(conditions, {diskRef : req.body.diskRef}) }
	if(req.body.diskSpace){ Object.assign(conditions, {diskSpace: req.body.diskSpace}) }
	if(req.body.processor){ Object.assign(conditions, {processor : req.body.processor}) }
	if(req.body.mouse){ Object.assign(conditions, {mouse : req.body.mouse}) }
	if(req.body.keyboard){ Object.assign(conditions, {keyboard : req.body.keyboard}) }
	if(req.body.diskSpace){ Object.assign(conditions, {OS: req.body.os}) }
	if(req.body.osLicense){ Object.assign(conditions, {licenseOS : req.body.osLicense}) }
	if(req.body.officeVersion){ Object.assign(conditions, {officeVersion : req.body.officeVersion}) }
	if(req.body.officeLicense){ Object.assign(conditions, {officeLicense : req.body.officeLicense}) }
	if(req.body.observation){ Object.assign(conditions, {observation : req.body.observation}) }
	if(req.body.diagnostic){ Object.assign(conditions, {diagnostic : req.body.diagnostic}) }
	if(req.body.recommendation){ Object.assign(conditions, {recommendation : req.body.recommendation}) }
	

	Equipment.findOneAndUpdate({equipmentId: req.session.equipmentId}, {$set: conditions}, {new: true}, (err, result) => {
		if (err){
			 return console.log(err)
		 }
		 res.render('dashboardequipment', {
			category: result.category,
			equipmentId: result.equipmentId,
			monitorId: result.monitorId,
			equipmentRef: result.equipmentRef,
			monitorRef: result.monitorRef,
			memoryRam:  result.memoryRam,
			diskRef:  result.diskRef,
			diskSpace:  result.diskSpace,
			processor: result.processor,
			mouse:  result.mouse,
			keyboard:  result.keyboard,
			OS:  result.OS,
			licenseOS:  result.licenseOS,
			officeVersion:  result.officeVersion,
			officeLicense:  result.officeLicense,
			observation:  result.observation,
			diagnostic:  result.diagnostic,
			recommendation: result.recommendation,
			resultshow: "Datos actualizados correctamente"
		 })
	});
});

app.get('/equipmentfilter', (req, res) =>{
	Equipment.find({}, (err, result) => {
		if(err){
			return console.log(err)
		} 
		req.session.listEquipments = result;
		res.render('equipmentfilter', {
			listEquipments : req.session.listEquipments
		})
	})
})

app.post('/equipmentfilter', (req, res) =>{
	if(req.body.deleteEquipment){
		Equipment.deleteOne({equipmentId : req.body.deleteEquipment}, (err, result) => {
			if(err){
				res.render('equipmentfilter',{
					listEquipments: req.session.listEquipments,
					error: 'Error al eliminar el equipo'
				})
			}
			res.render('equipmentfilter',{
				listEquipments: req.session.listEquipments,
				success: 'El equipo se eliminó correctamente'
			})
		});
	}
	res.render('equipmentfilter',{
		listEquipments: req.session.listEquipments
	})
})







app.get('/dashboardupdateuser', (req, res) =>{
	res.render('dashboardcreateitem',{
		coordinador: req.session.coordinador,
	})
})

app.post('/dashboardupdateuser', (req, res) =>{

	var conditions = {};

		if(req.body.firstname){
			Object.assign(conditions, {firstname : req.body.firstname})
		}
		if(req.body.lastname){
			Object.assign(conditions, {lastname : req.body.lastname})
		}
		if(req.body.phone){
			Object.assign(conditions, {phone : req.body.phone})
		}
		if(req.body.roll){
			Object.assign(conditions, {roll : req.body.roll})
		}

		User.findOneAndUpdate({_id: req.session.idUser}, {$set: conditions}, {new: true}, (err, resultado) => {
				if (err){
					 return console.log(err)
				 }console.log("hola" + resultado.firstname)
				 res.render('dashboardupdateuser', {
					 firstnameUser :  resultado.firstname,
					 lastnameUser : resultado.lastname,
					 emailUser :  resultado.email,
					 phoneUser : resultado.phone,
					 ccUser : resultado.cc,
					 rollUser : resultado.roll,
					 resultshow: "Datos actualizados correctamente"
				 })
		})
});

app.get('/dashboardprofile', (req, res) =>{
  	res.render('dashboardprofile', {
		})
});

// // Multer Storage
// var storage = multer.diskStorage({
// 	destination: function(req,file,cb){
// 		cb(null, 'public/uploads')
// 	},
// 	filename: function(req,file,cb){
// 		cb(null,'avatar' + req.session.name + path.extname(file.originalname))
// 	}
// })
// // Multer destin folder
// var upload = multer({storage:storage})

// Multer destin folder
var upload = multer({
	limits:{
		fileSize: 10000000
	},
	fileFilter(req,file,cb){
		if(!file.originalname.match(/\.(jpg|png|jpeg|JPG|PNG|JPEG)$/)){
			cb(new Error("No es un archivo valido"))
		}
		cb(null,true)
	  }
})

app.post('/dashboardprofile', upload.single('userPhoto') ,(req, res) =>{

	if(req.body.avatar){
			User.findOneAndUpdate({_id: req.session.user}, {$set: {avatar: req.file.buffer}},{new:true}, (err, resultado) => {
				if (err){
					 return;
				 }res.render('dashboardprofile', {
					avatar: resultado.avatar.toString('base64'),
					resultshow: "avatar cargado correctamente."
				  })
			})
	}
  if(req.body.infoprofile){
		var conditions = {};

		if(req.body.firstname){
			Object.assign(conditions, {firstname : req.body.firstname})
		}
		if(req.body.lastname){
			Object.assign(conditions, {lastname : req.body.lastname})
		}
		if(req.body.phone){
			Object.assign(conditions, {phone : req.body.phone})
		}
		if(req.body.password){
			Object.assign(conditions, {password : req.body.password})
		}

		User.findOneAndUpdate({_id: req.session.user}, {$set: conditions}, {new:true},(err, resultado) => {
				if (err){
					 return console.log(err);
				 }res.render('dashboardprofile', {
					 firstname :  resultado.firstname,
					 lastname : resultado.lastname,
					 email :  resultado.email,
					 phone : resultado.phone,
					 cc : resultado.cc,
					 roll : resultado.roll,
					 resultshow: "Datos actualizados correctamente."
				 })
		})
  }
});

app.get('/exit', (req, res) =>{
		//localStorage.setItem('token', ' ')
		res.locals.session = false
		req.session.destroy()

		Course.find({state: "Disponible"},(err,result)=>{
			if (err){
				return console.log(err)
			}
			res.render ('landing',{
				listado : result
			})
		})
});

app.get('/dashboardchat', (req, res) =>{
  	res.render('dashboardchat', {
			chatusername : req.query.chatusername,
			idm: req.session.user
		})
});
app.get('/dashboardchat2', (req, res) =>{
  	res.render('dashboardchat2', {
			chatusername : req.query.chatusername,
		})
});

app.get('/dashboardteacher', (req, res)=>{
// 	mismaterias = []
// 	User.find({_id: req.session.user},{cursos: 1, _id: 0}, (err,result)=>{
// 		if(err){
// 			console.log(err)
// 		}
// 		result.forEach(c=>{
// 			console.log(c.cursos)
// 			arr = c.cursos;
// 			arr.forEach(m=>{
// 				console.log(m)
// 				Course.find({name: m},(error, resultado)=>{
// 					if(error){
// 						console.log(error)
// 					}
// 					console.log(resultado) //resultado es lo que hay que enviar al helper para iterarlo
// 					req.session.mismaterias = mismaterias;
// 					mismaterias.push(req.session.mismaterias)
//
// 				})
// 			})
// 		})
// 		console.log('materias: ' + mismaterias)
// 		return res.render('dashboardteacher',{
// 			materias: mismaterias
// 	})
//
// })

	// User.find({cc: req.session.user, cursos: {$ne: 'null'}},(err,result) =>{
	// 	if(err){
	// 		return console.log(err)
	// 	}
	// 	console.log(result)
	// 	return res.render('dashboardteacher',{
	// 		materias: result
	// 	})
	// })

	User.find({_id: req.session.user},{cursos: 1, _id: 0},(err,result)=>{
		if(err){
			return console.log(err)
		}
		return res.render('dashboardteacher',{
			materias: result
		})
	})
})


module.exports = app;
