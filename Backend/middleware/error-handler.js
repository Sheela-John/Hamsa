const lodash=require('lodash');
const ERR = require('../errors.json');
function erroHandler(err,req,res,next){
    if (err instanceof Error) {
        // default to 500 server error
        return res.status(500).json(lodash.merge({status:false},ERR.UNKNOWN));
    }
    // custom application error
    return res.status(200).json(lodash.merge({status:false},err));
}

module.exports=erroHandler;