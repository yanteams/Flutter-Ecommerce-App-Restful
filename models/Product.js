const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    details: [{
        price: {
            type: Number,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    favoriteBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true }, {
    toJSON: {
        transform: function (doc, ret) {
            ret.userId = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        },
    },
}
);

module.exports = mongoose.model('Product', productSchema);