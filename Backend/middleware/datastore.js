'use strict'
const component = "DATASTORE";
const mongoose = require('mongoose');
const config = require('config');
const url = require('url');
mongoose.set("strictQuery", false);

mongoose.Promise = global.Promise;

mongoose.connection.on('connected', ()=> {
    const log = require('../util/logger').log(component, ___filename);
    log.debug(component, `connected to MongoDB instance at ${config.mongo.host}:${config.mongo.port}`);
    log.close();
});
mongoose.connection.on('disconnected', ()=> {
    const log = require('../util/logger').log(component, ___filename);
    log.debug(component, `disconnected from MongoDB instance at ${config.mongo.host}:${config.mongo.port}`);
    log.close();
});
mongoose.connection.on('error', (err)=> {
    const log = require('../util/logger').log(component, ___filename);
    log.debug(component, `MongoDB connection error: ${err}`);
    log.close();
});

// function connect() {
//     const log = require('../util/logger').log(component, ___filename);
//     var MONGO_URI = `mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.database}`;
//     log.debug(component, `connecting to: ${config.mongo.host}:${config.mongo.port}/${config.mongo.database}`);
//     var mongoURI = url.parse(MONGO_URI);
//     mongoose.connect(mongoURI.href, { useMongoClient: true });
//     log.close();

// }

function connect() {
    const log = require('../util/logger').log(component, ___filename);
	//Local setup
    var MONGO_URI = `mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.database}`;
    var mongoURI = new URL(MONGO_URI);
    mongoose.connect(mongoURI.href, {
        useNewUrlParser:true,
        useUnifiedTopology:true, 
        // poolSize: 100000, 
        // useCreateIndex: true 
    }) 
}
     // Production Setup
    //  var MONGO_URI = `mongodb://${config.mongo.userName}:${config.mongo.password}@${config.mongo.host1},${config.mongo.host2},${config.mongo.host3}/${config.mongo.database}?ssl=true&replicaSet=${config.mongo.replicaSet}&authSource=admin&retryWrites=true&w=majority`;
    //  log.debug(component, `connecting to: ${config.mongo.host}:${config.mongo.port}/${config.mongo.database}`);
    //  mongoose.connect(MONGO_URI, { useMongoClient: true, poolSize: 100000 })
    //  log.close();


function disconnect() {
    mongoose.connection.close();
    mongoose.disconnect();
}

module.exports = {
    connect: connect,
    disconnect: disconnect
}