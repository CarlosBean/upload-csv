const mongoose = require('mongoose');
const mongooseHidden = require('mongoose-hidden')();

const Schema = mongoose.Schema;

const customerSchema = new Schema({
    names: {
        type: [String],
        required: false //[true, 'name is required']
    },
    lastnames: {
        type: [String],
        required: false //[true, 'lastname is required']
    },
    addresses: {
        type: [String],
        required: false //[true, 'address is required']
    },
    phones: {
        type: [String],
        required: false //[true, 'phone is required']
    },
    campaign: {
        type: Schema.Types.ObjectId,
        ref: 'campaign',
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
});

customerSchema.plugin(mongooseHidden, { hidden: { _id: false } });

module.exports = mongoose.model('customer', customerSchema);