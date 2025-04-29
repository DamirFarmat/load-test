require('dotenv').config()

const express = require('express')
const sequelize = require('./db')
const models = require('./models/models.js')
const cors = require('cors')
const path = require('path')
const router = require('./routes/index.js')
const errorHandler = require('./middleware/ErrorHandingMiddleware')


const PORT = process.env.PORT

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', router)

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')))

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
})

//Обработка ошибок, последний блок
app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e){
        console.log(e)
    }
}

start()





