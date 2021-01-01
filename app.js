const express = require('express');
const dotenv = require('dotenv').config({path:__dirname+'/.env'})
const mongoose = require('mongoose')
const morgan = require('morgan');
const exphbs = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const path = require('path');
const port=process.env.PORT


require('/home/e-wave/Desktop/nodeoauth/config/passport.js')(passport)
//intialize the app
const app = express()


// general middlewares
//using morgan for login
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
//handlebars
app.engine('.hbs', exphbs({defaultLayout:'main',extname:'.hbs'}))
app.set('view engine','hbs')

//static folder 
app.use(express.static(path.join(__dirname,'public')))

//passport middleware
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false, 
}
))

app.use(passport.initialize())
app.use(passport.session())



// app.set('view engine','ejs')



//connect db
 const connectDB = async () =>{
     try {
         const connect = await mongoose.connect(process.env.dbURI, 
            {useCreateIndex:true,
            useUnifiedTopology:true,
            useNewUrlParser:true
        },
        console.log('connected to db'))
        
     } catch (err) {
         console.error(err)
         process.exit(1)
     }
 }
 connectDB()

 //routes
 app.use('/', require('./routes/index'))
 app.use('/auth', require('./routes/auth'))

app.listen(port, ()=>{
    console.log(`server running on ${process.env.NODE_ENV} mode on port ${port}`)

})