const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: { type: String, require: true },
    title: { type: String, require: true },
    category: { type: String, require: true },
    imageUrl: { type: [String], require: true },
    oldPrice: { type: String, require: true },
    sizes: {
        type: [{
            size: {
                type: String, required: true
            },
            isSelected: {
                type: Boolean, required: false,
            }
        }],
    },
    price: { type: String, require: true },
    description: { type: String, require: true },

}, { timestamps: true });
module.exports = mongoose.model("Product", ProductSchema)