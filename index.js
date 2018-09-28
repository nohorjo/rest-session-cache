const express = require('express');
const { authenticator } = require('otplib');
const merge = require('recursive-deep-merge');

if (!process.env.SECRET) throw "SECRET not set";

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
    resp.send(sessionCache);
});

app.get('/:sid', ({param: {sid}}, resp) => {
    resp.send(sessionCache[sid]);
});

app.delete('/', (req, resp) => {
    sessionCache = {};
    resp.sendStatus(201);
});

app.delete('/:sid', ({param:{sid}}, resp) => {
    delete sessionCache[sid];
    resp.sendStatus(201);
});

app.post('/:sid', ({param: {sid}, body: next}, resp) => {
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

