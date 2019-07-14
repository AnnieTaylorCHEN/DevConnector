const express = require('express')
const router = express.Router()

//route: GET api/posts
//note: test route
//access: public (no token needed)
router.get('/', (req, res) => {
    res.send('Posts route')
})

module.exports = router