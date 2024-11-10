// db.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log('Database connected');
        return client.db('deliveryapp'); // Use your actual database name
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error; // Rethrow to handle in the calling function
    }
}

module.exports = connectDB;
