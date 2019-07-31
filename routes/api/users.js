const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

const User = require('../../models/User')

//route: POST api/users
//note: register user
//access: public (no token needed)
router.post('/',
    [
        check('name', 'Name is required')
        .not()
        .isEmpty(),
        check('email', 'Please use a valid email')
        .isEmail(),
        check('password', 'Must be 6 or more characters')
        .isLength({ min: 6 })
    ] ,
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const { name, email, password } = req.body
        try {
        //see if user exists
            let user = await User.findOne({email})
            if (user) {
                return res.status(400).json({errors: [{msg: 'User already exists'}]})
            }
        //get users' gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'robohash'
            })
        //create new user with req info and avatar
            user = new User({
                name, 
                email, 
                avatar,
                password
            })
        //encrypt password + save user
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
            await user.save()
        //get user id after saving, return jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(
                payload, 
                config.get('jwtSecret'),
                {expiresIn: 360000 },
                (error, token) => {
                    if (error) throw error 
                    res.json({ token })
                })
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server error')
        }
    })

module.exports = router