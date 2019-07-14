const jwt = require('jsonwebtoken')
const config = require('config')

const auth = (req, res, next) => {
    //get token from header
    const token = req.header('x-auth-token')
    //check if there is no token 
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied'})
    }
    //if there is token verify the token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = decoded.user
        next()
    } catch (error) {
        res.status(401).json({ msg: 'token is not valid'})
    }
}

module.exports = auth