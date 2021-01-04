const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest} = require('../middleware/auth.js')
const Story = require('../models/story')


//login / landing page
router.get('/', ensureGuest,(req,res) =>{
    res.render('login', {layout:'login'})
})

//dashboard routes
router.get('/dashboard',ensureAuth, async (req,res) =>{

    try {
        const stories = await Story.find({user:req.user.id}).lean()
        const contextVariables= {name:req.user.firstName, stories}
        res.render('dashboard',contextVariables)
        
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports = router