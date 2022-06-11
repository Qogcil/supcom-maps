// modules
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

// server
const server = express()

// routes
const mapRouter = require('./routes/map-route')

// middleware options 
const corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// middleware
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())
server.use(cors());

// paths
server.use('/maps', mapRouter)
server.get('/', (req, res) => {
	res.send('supcom maps API');
})
server.use('/previews', express.static('maps'))

// error handling
// 500
server.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('something is broken')
})
// 404
server.use((req, res, next) => {
  res.status(404).send('sorry we could not find that')
})

// export
module.exports = server;