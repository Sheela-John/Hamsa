const { timeStamp } = require('console');
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const QRcodeImageSchema = new Schema(
    {
        imageFileName: {
            type: String
        },
        image: {
            type: String
        },
        loginId: {
            type: String
        },
        documentID: { type: String },
        isDeleted: {
            type: Number,
            default: 0    //0-not deleted   1-Deleted  2-Already saved as institutionEvents
        }
    }, {
    collection: 'QRcodeImage',
    versionKey: false,
    timestamps: true
}
)
const QrCodeImage = mongoose.model('eventImage', QRcodeImageSchema)
module.exports = QrCodeImage