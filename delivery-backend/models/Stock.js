// models/Stock.js
const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    product_id: { type: Number, required: true },
    stock_available: { type: Boolean, required: true }
}, { collection: 'Stock' });  // Ensure the collection name is 'stock'

module.exports = mongoose.model('Stock', StockSchema);
