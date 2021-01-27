const router = require('express').Router()
const csrf = require('csurf')
const { ensureAuth} = require('../middleware/auth.js')
const Story = require('../models/story')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')


//body parser middleware


//csrf middleware
const csrfProtection = csrf({cookie:true})
router.use(csrfProtection());
const parseForm = bodyParser.urlencoded({extended: false})
router.use(bodyParser.json())
router.use(parseForm())
//router cookie middleware
router.use(cookieParser())


//login / show add story
router.get('/add', ensureAuth, csrfProtection ,(req,res) =>{
    
    res.render('story/add',{csrfToken:req.csrfToken()})
})


//login / spost story
router.post('/' , ensureAuth, parseForm, csrfProtection, async (req,res) =>{
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res,render('error/500')
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
    try {
      let story = await Story.findById(req.params.id).populate('user').lean()
  
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

    try {
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
  } 

    catch(err) {
        console.error(err)
        return res.render('error/500')

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

    try {
        await Story.remove({_id:req.params.id})
        res.redirect('/dashboard')
        
    } catch (err) {
        console.error(err)
        return res.render('error/500')  
    }
})


//get the use story from the user icon links
router.get('/user/:id', ensureAuth, async (req,res) =>{

    try {
        const stories = await Story.find({
            user:req.params.id,
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