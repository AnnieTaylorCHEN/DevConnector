const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')
const auth = require('../../middleware/auth')

const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

//route: POST api/posts
//note: create post
//access: private
router.post('/', [auth, [
    check('text', 'Text is required.')
    .not()
    .isEmpty()
] ], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const user = await User.findById(req.user.id).select('-password')
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })
        const post = await newPost.save()
        res.json(post)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }    
})

//route: GET api/posts
//note: get all the posts
//access: private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({date: -1})
        res.json(posts)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})


//route: GET api/posts/:id
//note: get post by id
//access: private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(400).json({msg: 'Post not found'})
        }
        res.json(post)
    } catch (error) {
        console.error(error.message)
        if (error.kind === 'ObjectId'){
            return res.status(400).json({msg: 'Post not found'})
        }
        res.status(500).send('Server error')
    }
})

//route: DELETE api/posts/:id
//note: delete by id
//access: private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(400).json({msg: 'Post not found'})
        }
        //check whether logged in user has right to the post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User not authorized'})
        }
        await post.remove()
        res.json({msg: 'Post removed.'})
    } catch (error) {
        console.error(error.message)
        if (error.kind === 'ObjectId'){
            return res.status(400).json({msg: 'Post not found'})
        }
        res.status(500).send('Server error')
    }
})

//route: PUT api/posts/like/:id
//note: Like a post
//access: private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        //check if the post has been liked by the user already
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: 'Post already liked.'})
        }
        post.likes.unshift({user: req.user.id})
        await post.save()
        res.json(post.likes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

//route: PUT api/posts/unlike/:id
//note: Like a post
//access: private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        //check if the post has not been liked by the user yet
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post has not been liked.'})
        }
        //get remove index
        const removeIndex = post.likes
        .map(like => like.user.toString())
        .indexOf(req.user.id)
        post.likes.splice(removeIndex, 1)
        await post.save()
        res.json(post.likes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

//route: POST api/posts/comment/:id
//note: comment on a post
//access: private
router.post('/comment/:id', [auth, [
    check('text', 'Text is required.')
    .not()
    .isEmpty()
] ], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    try {
        const user = await User.findById(req.user.id).select('-password')
        const post = await Post.findById(req.params.id)
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }
        post.comments.unshift(newComment)
        await post.save()
        res.json(post.comments)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }    
})

//route: DELETE api/posts/comment/:id/:comment_id
//note: delete comment
//access: private
router.delete('/comment/:id/:comment_id', auth, async (req, res)=> {
    try {
        const post = await Post.findById(req.params.id)
        //pull out comment
        const comment = post.comments.find(comment=> comment.id === req.params.comment_id)
        //see if comment exists
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found.'})
        }
        //check if comment belongs to user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized.'})
        }
        //get remove index
        const removeIndex = post.comments
        .map(comment => comment.user.toString())
        .indexOf(req.user.id)
        post.comments.splice(removeIndex, 1)
        await post.save()
        res.json(post.comments)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

module.exports = router