const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, default: null },
    cart: {
        type: Array,
        default: [],
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
    },
    // address: [{
    //     type: mongoose.Schema.Types.ObjectId, ref: "Address"
    // }],
    // wishlist: [{
    //     type: mongoose.Schema.Types.ObjectId, ref: "Product"
    // }],
}, { timestamps: true }, {
    toJSON: {
        transform: function (doc, ret) {
            ret.userId = ret._id.toString();
            delete ret._id;
            delete ret._v;
        },
    },
}
);


const User = mongoose.model('User', userSchema);

module.exports = User;