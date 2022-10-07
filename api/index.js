const inicioDebug=require('debug')('app:inicio');
const dbDebug=require('debug')('app:db');
const { json } = require('express');
const express=require('express');
const Joi=require('joi')
const app=express();
//const logger=require('./logger')
const morgan=require('morgan')
const config=require('config')

const usuarios=[
    {id:1,nombre:"Grover"},
    {id:2,nombre:"Pablo"},
    {id:3,nombre:"Ana"}
];

app.use(express.json());

//URLENCODER Uso de valores inscritos en url
app.use(express.urlencoded({extended:true}))

//Static uso de recursos estaticos
app.use(express.static('public'))


//configuracion de entorno
console.log('Aplicacion '+config.get('nombre'));
console.log('BD server: '+config.get('configDB.host'))


//Funciones middleware
/*app.use(logger)

app.use(function(req,res,next){
    console.log('autenticando....')
    next()
})*/

//Middleware de tercero
if(app.get('env')==='development'){
    app.use(morgan('tiny'))
    //console.log('morgan habilitado')
    inicioDebug("Morgan esta habilitado")
}

//trabajos con la base de datos
dbDebug('conectando con la base de datos')

app.get("/",(req,res)=>{
    res.send("Hola Mundo desde express");
});//Peticion

app.get("/api/usuarios",(req,res)=>{
    res.send(usuarios);
});

app.get("/api/usuarios/:id",(req,res)=>{
    let usuario=existeUsuario(req.params.id);
    
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado')
        return;
    } 

    res.send(usuario);
});

app.post("/api/usuarios",(req,res)=>{
    const {error,value}=validarUsuario(req.body.nombre);
    if(!error)
    {
        const usuario={
            id:usuarios[usuarios.length-1].id+1,
            nombre:value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }
    else{
        res.status(400).send(error.details[0].message)
    }
    
});

app.put("/api/usuarios/:id",(req,res)=>{

    //encontrar si existe usuario
    
    let usuario=existeUsuario(req.params.id);
    
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado')
        return;
    } 

    const {error,value}=validarUsuario(req.body.nombre)

    if(error){
        const mensaje=error.details[0].message;
        res.status(400).send(mensaje)
        return;
    }

    usuario.nombre=value.nombre;
    res.send(usuario);

})

app.delete('/api/usuarios/:id',(req,res)=>{
    let usuario=existeUsuario(req.params.id);
    
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado')
        return;
    }
    
    const index=usuarios.indexOf(usuario)
    usuarios.splice(index,1)
    res.send(usuarios)
})

const port=process.env.PORT || 3000;

app.listen(port,()=>{
    console.log("Escuchando en el puerto "+port);
});

function existeUsuario(id){
    return(usuarios.find(u=>u.id===parseInt(id)));
}
  //Validacion con joi
function validarUsuario(nom){
    const schema=Joi.object({
        nombre:Joi.string().min(3).required()
    });
    return schema.validate({nombre:nom});
}

module.exports = app;