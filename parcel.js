var mongoose = require('mongoose');

var parcelSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String
    },
    address: {type: String},
    weight: {type: Number},
    fragile: {type: String}
});

module.exports = mongoose.model('Parcel', parcelSchema);