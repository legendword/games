const { allowOrigin, indexPort, localBaseURL, latestVersion } = require('./constants');
const games = require('./games');

const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
//const { v4: uuidv4 } = require('uuid');

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.post('/', (req, res) => {
    res.json({
        success: true,
        version: latestVersion
    })
})

app.post('/status', (req, res) => {
    res.json(games)
})

http.listen(indexPort, () => {
    console.log(`Running Index on port ${indexPort} with version ${latestVersion}`);
});