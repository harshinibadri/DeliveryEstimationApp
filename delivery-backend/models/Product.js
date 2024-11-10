// models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    product_id: { type: Number, required: true },
    product_name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String } // Optional field for image URL
}, { collection: 'Products' }); // Explicit collection name

module.exports = mongoose.model('Product', ProductSchema);
