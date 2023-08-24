const { timeStamp } = require('console');
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const assignServiceInvoiceSchema = new Schema(
    {
        imageFileName: {
            type: String
        },
        image: {
            type: String
        },
        assignServiceId: {
            type: String
        },
       
        documentID: { type: String },
      
        isDeleted: {
            type: Number,
            default: 0    //0-not deleted   1-Deleted  2-Already saved as institutionEvents
        }
    }, {
        collection: 'assignServiceInvoice',
    versionKey: false,
    timestamps:true
}
)
const AssignServiceInvoice = mongoose.model('assignServiceInvoice', assignServiceInvoiceSchema)
module.exports = AssignServiceInvoice