const express = require('express')
const router = express.Router()
const request = require('request')
const config = require('config')
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Profile = require('../../models/Profile')
const User = require('../../models/User')
const Post = require('../../models/Post')

//route: GET api/profile/me
//note: get current user's profile
//access: private (token required)
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id }).populate(
                'user', 
                ['name', 'avatar'])
        if (!profile) {
            return res.status(400).json({})
        }
        res.json(profile)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})

//route: POST api/profile
//note: create or update user profile
//access: private (token required)
router.post('/', [auth, [
    check('status', 'Status is required.')
    .not()
    .isEmpty(),
    check('skills', 'Skills is required.')
    .not()
    .isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()})
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook, 
        twitter,
        instagram,
        linkedin

    } = req.body

    //build profile object
    const profileFields = {}
    profileFields.user = req.user.id
    if (company) profileFields.company = company
    if (website) profileFields.website = website
    if (location) profileFields.location = location
    if (bio) profileFields.bio = bio
    if (status) profileFields.status = status
    if (githubusername) profileFields.githubusername = githubusername
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }
    //build social object 
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube
    if (twitter) profileFields.social.twitter = twitter
    if (facebook) profileFields.social.facebook = facebook
    if (linkedin) profileFields.social.linkedin = linkedin
    if (instagram) profileFields.social.instagram = instagram
    try {
        let profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileFields},
                {new: true, upsert: true}
            )
            res.json(profile)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})


//route: GET api/profile
//note: get all profiles
//access: public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find()
        .populate(
            'user',
            ['name', 'avatar'])
        res.json(profiles)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})

//route: GET api/profile/user/:user_id
//note: get profile by id
//access: public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id})
        .populate(
            'user',
            ['name', 'avatar'])
        if (!profile) {
            res.status(400).json({ msg: 'profile not found'})
        }
        res.json(profile)
    } catch (error) {
        console.error(error.message)
        if (error.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'profile not found'})
        }
        res.status(500).send('server error')
    }
})

//route: DELETE api/profile
//note: delete profile, user and posts
//access: private
router.delete('/', auth, async (req, res) => {
    try {
        //remove users posts
        await Post.deleteMany({user: req.user.id})
        //remove profile and user
        await Profile.findOneAndRemove({ user: req.user.id })
        await User.findOneAndRemove({_id: req.user.id})
        res.json({ msg: 'User deleted.'})
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})

//route: PUT api/profile/experience
//note: add profile experience
//access: private
router.put('/experience', [auth, [
    check('title', 'Title is required')
    .not()
    .isEmpty(),
    check('company', 'Company is required')
    .not()
    .isEmpty(),
    check('from', 'From date is required')
    .not()
    .isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()})
    }
    const {
        title,
        company, 
        location,
        from,
        to, 
        current,
        description
    } = req.body

    const newExp = {
        title,
        company, 
        location,
        from,
        to, 
        current,
        description
    }
    
    try {
        const profile = await Profile.findOne({user: req.user.id})
        profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})

//route: DELETE api/profile/experience
//note: delete profile experience
//access: private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id})
        //get remove index
        const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id)
        profile.experience.splice(removeIndex, 1)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})

//route: PUT api/profile/education
//note: add profile education
//access: private
router.put('/education', [auth, [
    check('school', 'School is required')
    .not()
    .isEmpty(),
    check('degree', 'Degree is required')
    .not()
    .isEmpty(),
    check('fieldofstudy', 'Field of Study is required')
    .not()
    .isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()})
    }
    const {
        school,
        degree, 
        fieldofstudy,
        from,
        to, 
        current,
        description
    } = req.body

    const newEdu = {
        school,
        degree, 
        fieldofstudy,
        from,
        to, 
        current,
        description
    }
    
    try {
        const profile = await Profile.findOne({user: req.user.id})
        profile.education.unshift(newEdu)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})

//route: DELETE api/profile/education
//note: delete profile education
//access: private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id})
        //get remove index
        const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id)
        profile.education.splice(removeIndex, 1)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})

//route:GET api/profile/github/:username
//note: get user repos from github
//access: public
router.get('/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubClientSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js'}
        }
        request(options, (error, response, body) => {
            if (error) console.error(error)
            if (response.statusCode !== 200 ) {
                return res.status(404).json({ msg: 'Not Github profile found.'})
            }
            res.json(JSON.parse(body))
        })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})


module.exports = router