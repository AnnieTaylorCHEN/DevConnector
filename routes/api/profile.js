const express = require('express')
const router = express.Router()

//route: GET api/profile
//note: test route
//access: public (no token needed)
router.get('/', (req, res) => {
    res.send('Profile route')
})

module.exports = router