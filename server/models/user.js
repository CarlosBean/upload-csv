const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongooseHidden = require('mongoose-hidden')();

const Schema = mongoose.Schema;

const allowedRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is not allowed'
};

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'email is required']
    },
    password: {
        type: String,
        required: [true, 'password is required']
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: allowedRoles
    },
    img: {
        type: String,
        required: false
    },
    status: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// hidden properties manually

/* userSchema.methods.toJSON = function() {
    const user = this;
    let userObject = user.toObject();
    delete userObject.password;
} */

userSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' });
userSchema.plugin(mongooseHidden, { hidden: { _id: false, password: true } });

module.exports = mongoose.model('user', userSchema);