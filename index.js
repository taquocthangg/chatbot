const express = require('express');
const http = require('http');
require('dotenv').config();
const cors = require('cors');
require('./src/config/connection_db');
const initRoutes = require('./src/routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
initRoutes(app);
const server = http.createServer(app);

const PORT = process.env.PORT || 8000;
const listener = server.listen(PORT, () => {
    console.log('Server is running on the port ' + listener.address().port);
});