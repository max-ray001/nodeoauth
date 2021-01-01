const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest} = require('../middleware/auth.js')


//login / landing page
router.get('/', ensureGuest,(req,res) =>{
    res.render('login', {layout:'login'})
})

//dashboard routes
router.get('/dashboard',ensureAuth,(req,res) =>{
    res.render('dashboard')
})

module.exports = router