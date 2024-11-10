const mongoose = require('mongoose');

// Define schema for Pincode with 'pincode' as a String
const pincodeSchema = new mongoose.Schema({
    pincode: { type: String, required: true },  // Ensure the pincode is a string to match your database
    'Logistics Provider': { type: String },
    TAT: { type: Number }
});

// Create the Pincode model with the correct collection name "pincodes"
const Pincode = mongoose.model('Pincode', pincodeSchema, 'pincodes');

module.exports = Pincode;
