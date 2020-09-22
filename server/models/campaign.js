const mongoose = require('mongoose');
const mongooseHidden = require('mongoose-hidden')();

const Schema = mongoose.Schema;

const campaignSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    description: {
        type: String,
        required: false
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

campaignSchema.plugin(mongooseHidden, { hidden: { _id: false } });

module.exports = mongoose.model('campaign', campaignSchema);