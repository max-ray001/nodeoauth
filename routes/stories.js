const express = require('express')
const router = express.Router()
const { ensureAuth} = require('../middleware/auth.js')
const Story = require('../models/story')


//login / show add story
router.get('/add', ensureAuth,(req,res) =>{

    res.render('story/add')
})


//login / spost story
router.post('/', ensureAuth, async (req,res) =>{
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res,render('error/500')
    }
})

//redner all stories
router.get('/', ensureAuth,  async (req,res) =>{
    try {
        const stories =  await Story.find({status: 'public' })
    .populate('user')
    .sort({createdAt: 'desc' })
    .lean()
    res.render('story/index', stories)
    }
    catch (err){
        console.error(err)
        res.render('error/500')
    }
})

//show edit story view
router.get('/edit/:id', ensureAuth, async (req,res) =>{

    const story = await Story.findOne({
        _id:req.params.id
    }).lean()

    if (!story){
        res.render('error/404')
    }

    if (story.user != req.user.id){
        res.redirect('/stories')
    } else {
        res.render('story/edit',{
            story
        })
    }
})

//update stories afer editing via a PUT
router.put('/:id', ensureAuth, async (req,res) =>{

    try {
    let story = await Story.findById(req.params.id).lean()

    if (!story){
        res.render('error/404')
    }


    if (story.user != req.user.id){
        res.redirect('/stories')
    } else {
        story = Story.findOneAndUpdate({_id:req.params.id}, req.body,{
            new:true,
            runValidators:true
        })
     }
     res.redirect('/dashboard')

    }

    catch (err) {
        console.error(err)
        res.render('error/500')
    }
})




module.exports = router