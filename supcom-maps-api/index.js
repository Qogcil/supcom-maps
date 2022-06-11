// serve server
const server = require('./server.js')
const port = process.env.PORT || 9001

server.listen(port, () => {
	  console.log(`Server listening on port ${port}`);
})