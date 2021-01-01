const express = require('express')
const passport = require('passport')
const router = express.Router()


//auth with google base url on app.js is /auth
// landing/login page

router.get('/google', passport.authenticate('google',{scope:['profile']}))


//call back route with /auth/google/callback

router.get('/google/callback',passport.authenticate('google', { failureRedirect: '/' }),
(req, res) => {
    res.redirect('/dashboard')

})
  // Successful authentication, redirect home.

  //logout users

router.get('/logout', (req,res)=> {
    req.logout()
    res.redirect('/')

})

module.exports = router