const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

const User = require('../../models/User')

//route: GET api/auth
//note: test route
//access: public (no token needed)
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error ')
    }
})

//route: POST api/auth
//note: authenticate user & get token
//access: public (no token needed)
router.post('/',
    [
        check('email', 'Please use a valid email')
        .isEmail(),
        check('password', 'Password is required')
        .exists()
    ] ,
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const { email, password } = req.body
        try {
        //find user by email, see if password matches
            let user = await User.findOne({email})
            if (!user) {
                return res.status(400).json({errors: [{msg: 'Invalid credentials'}]})
            }
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({errors: [{msg: 'Invalid credentials'}]})
            }

        //get user id, return jsonwebtoken
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
                    res.json({ token, user })
                })
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Server error')
        }
    })


module.exports = router