const express = require('express')

const app = express()

app.get('/', (req, res) => {
    res.send('API running yeah~')
})

const PORT = process.env.PORT || 5000

app.listen( PORT, ()=> {
    console.log(`App is running on ${PORT}.`)
})