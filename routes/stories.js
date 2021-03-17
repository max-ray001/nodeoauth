const router = require('express').Router();
const csrf = require('csurf');
const { ensureAuth} = require('../middleware/auth.js');
const mongoose = require('mongoose');
const Story = require('../models/story');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

//router cookie middleware
router.use(cookieParser())
//csrf middleware
const csrfProtection = csrf({cookie:true})
//body parser middleware
const parseForm = bodyParser.urlencoded({extended: false})
router.use(bodyParser.json())




//login / show add story
router.get('/add', ensureAuth, csrfProtection ,(req,res) =>{
    
    res.render('story/add',{csrfToken:req.csrfToken()})
})


//login / post story
router.post('/' , ensureAuth, parseForm, csrfProtection, async (req,res) =>{
    const id = mongoose.Types.ObjectId(req.params.id)
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

//render all stories
router.get('/', ensureAuth,  async (req,res) =>{
    try {
        const stories =  await Story.find({status: 'public' })
    .populate('user')
    .sort({createdAt: 'desc' })
    .lean()
    res.render('story/index',{stories})
    }
    catch (err){
        console.error(err)
        res.render('error/500')
    }
})


//GET show a single story in the readmore button
router.get('/:id', ensureAuth, async (req, res) => {
    const id = mongoose.Types.ObjectId(req.params.id)
    try {
      let story = await Story.findById(id).populate('user').lean()
  
      if (!story) {
        return res.render('error/404')
      }
  
      if (story.user._id != req.user.id && story.status == 'private') {
        res.render('error/404')
      } else {
        res.render('story/show', {
          story,
        })
      }
    } catch (err) {
      console.error(err)
      res.render('error/404')
    }
  })



//show edit story view
router.get('/edit/:id', ensureAuth, async (req,res) =>{

    const id = mongoose.Types.ObjectId(req.params.id)
    try {
    const story = await Story.findOne({
        _id:id
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
  } 

    catch(err) {
        console.error(err)
        return res.render('error/500')

    }
})

//update stories afer editing via a PUT
router.put('/:id', ensureAuth, async (req,res) =>{

    const id = mongoose.Types.ObjectId(req.params.id)
    try {
    let story = await Story.findById(req.params.id).lean()

    if (!story){
        res.render('error/404')
    }


    if (story.user != req.user.id){
        res.redirect('/stories')
    } else {
        story = Story.findOneAndUpdate({_id:req.params.id}, req.body,{
            new: true,
            runValidators: true
        })
     }
     res.redirect('/dashboard')

    }
    catch (err) {
        console.error(err)
        res.render('error/500')
    }
})


//delete a story from the database
router.delete('/:id', ensureAuth, async (req,res) =>{

    const id = mongoose.Types.ObjectId(req.params.id)
    try {
        let story = await Story.findById(req.params.id).lean()
  
        if (!story) {
          return res.render('error/404')
        }
        if (story.user != req.user.id) {
            res.redirect('/stories')
          } else {
        await Story.remove({_id:req.params.id})
        res.redirect('/dashboard')
          }
        
    } catch (err) {
        console.error(err)
        return res.render('error/500')  
    }
})


//get the user story from the user icon links
router.get('/user/:id', ensureAuth, async (req,res) =>{

    const id = mongoose.Types.ObjectId(req.params.id)
    try {
        const stories = await Story.find({
            user:id,
            status:'public'
        })
        .populate('user').lean()

        res.render('story/index', {
            stories
        })
        
    } catch (err) {
        console.error(err)
        res.render('error/500')
        
    }

    res.render('story/add')
})




module.exports = router