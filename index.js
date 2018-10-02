const express = require('express');
const { authenticator } = require('otplib');
const merge = require('recursive-deep-merge');
const crypto = require('crypto');

if (!process.env.SECRET) throw "SECRET not set";

const algorithm = 'aes-128-cbc';
const iv = crypto.createHash('sha1').update(process.env.SECRET).digest('hex').substr(0, 16);
const password = crypto.createHash('sha256').update(process.env.SECRET).digest('hex').substr(0, 16);

const app = express();
let sessionCache = {};

app.use((req, resp, next) => {
    if (authenticator.check(req.query,otp, process.env.SECRET)) {
        next();
    } else {
        console.warn('Unauthorised request', req.ip);
        resp.status(401).send({now: Date.now()});
    }
});

app.use(express.json({limit:'10MB'}));

app.get('/', (req, res) => {
    resp.send(encrypt(JSON.stringify(sessionCache)));
});

app.get('/:sid', ({params: {sid}}, resp) => {
    resp.send(encrypt(JSON.stringify(sessionCache[sid])));
});

app.delete('/', (req, resp) => {
    sessionCache = {};
    resp.sendStatus(201);
});

app.delete('/:sid', ({params:{sid}}, resp) => {
    delete sessionCache[sid];
    resp.sendStatus(201);
});

app.post('/:sid', ({params: {sid}, body: {next}}, resp) => {
    next = JSON.parse(decrypt(next));
    const old = sessionCache[sid];
    if (!old) {
        sessionCache[sid] = next;
    } else {
        sessionCache[sid] = merge(old, next);
    }
    resp.sendStatus(201);
});

const port = process.env.PORT || 80;

app.listen(port, () => console.log(`Server listening on port ${port}`));

function encrypt(text) {
    var cipher = crypto.createCipheriv(algorithm, password, iv);
    var crypted = cipher.update(text, 'utf8', 'base64');
    crypted += cipher.final('base64');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipheriv(algorithm, password, iv);
    var dec = decipher.update(text, 'base64', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

