const { allowOrigin, indexPort, localBaseURL, latestVersion } = require('./constants');
const games = require('./games');

const express = require('express');
const app = express();
// const http = require('http').Server(app);
// /*
const httpsLib = require('https');
const fs = require('fs');
const privateKey = fs.readFileSync('../ssl/legendword.key', 'utf8');
const certificate = fs.readFileSync('../ssl/legendword.crt', 'utf8');
const https = httpsLib.createServer({
    key: privateKey,
    cert: certificate
}, app)
// */
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

https.listen(indexPort, () => {
// http.listen(indexPort, () => {
    console.log(`Running Index on port ${indexPort} with version ${latestVersion}`);
});