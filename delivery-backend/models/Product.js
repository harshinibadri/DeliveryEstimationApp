const mongoose = require('mongoose');

// Define the Product Schema
const productSchema = new mongoose.Schema({
    product_id: { type: Number, required: true },
    product_name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
});

// Create the Product model (explicitly mention the collection name "Products")
const Product = mongoose.model('Product', productSchema, 'Products');

module.exports = Product;
