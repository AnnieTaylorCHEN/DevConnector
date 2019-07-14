const express = require('express')
const connectDB = require('./config/db')

const app = express()

//connect to the database
connectDB()

//middleware
app.use(express.json({ extended: false }))

//main page
app.get('/', (req, res) => {
    res.send('API running yeah~')
})

//Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))

//port
const PORT = process.env.PORT || 5000

app.listen( PORT, ()=> {
    console.log(`App is running on ${PORT}.`)
})