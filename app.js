const express = require('express');
const methodOverride = require('method-override');
const dotenv = require('dotenv').config({path:__dirname+'/.env'})
const mongoose = require('mongoose')
const morgan = require('morgan');
const exphbs = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const path = require('path');
const bodyParser = require('body-parser');
const port=process.env.PORT


require('/home/e-wave/Desktop/nodeoauth/config/passport.js')(passport)
//intialize the app
const app = express()



// general middlewares
//using morgan for login
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//body parser middleware
app.use(express.urlencoded({extended:false}))
app.use(express.json())
//method override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  }))

//register handlebars helpers
const {formatDate, stripTags,truncate,editIcon,select} = require('./helpers/hbs')
//handlebars

app.engine('.hbs', exphbs({helpers:{
    formatDate,stripTags,truncate,editIcon,select
}, defaultLayout:'main',extname:'.hbs'}))
app.set('view engine','hbs')

//static folder 
app.use(express.static(path.join(__dirname,'public')))

//passport middleware
//session database storage
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false, 
    store: new MongoStore({mongooseConnection:mongoose.connection})
}
))

app.use(passport.initialize())
app.use(passport.session())

//global environment variable
app.use((req,res,next) =>{
    res.locals.user = req.user || null
    next();

})



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
 app.use('/stories', require('./routes/stories'))

app.listen(port, ()=>{
    
    console.log(`server running on ${process.env.NODE_ENV} mode on port ${port}`)

})