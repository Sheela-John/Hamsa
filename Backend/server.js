'use strict'

const component = "server";
const fs = require('fs');
const http = require('http');
const https = require('https');
const { mainStory, chalk } = require('storyboard');
const config = require('config');
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const ERR = require('./errors.json');
const multer = require('multer');
const cors = require('cors');
const errorHandler = require('./middleware/error-handler');
const pkg = require('./package.json');

// custom middleware
require('./middleware/logging');
require('./middleware/environment')();
const datastore = require('./middleware/datastore');

// app setup
var app = express();


// common middleware
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(helmet());

app.get('/', (req, res) => {
    res.json(`{${pkg.name} API Server ver ${pkg.version}}`);
})

// routes
app.use('/auth', require('./routes/auth.route'));
app.use('/staff', require('./routes/staff.route'));
app.use('/role', require('./routes/role.route'));
app.use('/branch', require('./routes/branch.route'));
app.use('/settings', require('./routes/settings.route'));
app.use('/assignService', require('./routes/assignService.route'));
app.use('/services', require('./routes/services.route'));
app.use('/serviceRequest', require('./routes/serviceRequest.route'));
app.use('/report', require('./routes/report.route'));
app.use('/attendence', require('./routes/attendence.route'));
app.use('/client', require('./routes/client.route'));
app.use('/branchTransfer', require('./routes/branchTransfer.route'));

app.use(errorHandler);


app.use(function (req, res, next) {
    const log = require('./util/logger').log(component, ___filename);
    log.error(component, `${req.method} ${req.originalUrl} ${ERR.NOT_FOUND}`);
    log.close();
    res.status(404).send('Not Found');
});

// env vars
var port = process.env.PORT || config.http.port || '3000'
app.set('port', port);

// start server
var server;
if (config.http.secure) {
    var privateKey = fs.readFileSync('cert/key.pem', 'utf8');
    var certificate = fs.readFileSync('cert/cert.pem', 'utf8');
    var credentials = { key: privateKey, cert: certificate };
    server = https.createServer(credentials, app);
} else {
    server = http.createServer(app);
}
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// server event handlers
function onError(error) {
    const log = require('./util/logger').log(component, ___filename);
    if (error.syscall !== 'listen') {
        datastore.disconnect();
        log.close();
        throw error;
    }
    switch (error.code) {
        case 'EACCES':
            log.error(component, `${port} requires elevated privileges`);
            datastore.disconnect();
            log.close();
            process.exit(1);
            break;
        case 'EADDRINUSE':
            log.error(component, `${port} is already in use`);
            datastore.disconnect();
            log.close();
            process.exit(1);
            break;
        default:
            log.error(component, 'server error', { attach: error });
            log.close();
            throw error;
    }
}

function onListening() {
    const log = require('./util/logger').log(component, ___filename);
    if (!config.http.secure) log.warn('starting non-secure server');
    log.info(component, `${chalk.green.bold(require('./package.json').name + ' server ver ' + require('./package.json').version + ' started on port ' + app.get('port'))}`);
    log.close();
    datastore.connect();
}
