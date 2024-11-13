const { MongoClient } = require('mongodb');

// Use environment variable for the URI, fallback to local MongoDB if not defined
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let dbInstance = null;

async function connectDB() {
    if (dbInstance) {
        // Return the existing database instance if already connected
        return dbInstance;
    }

    try {
        // Attempt to connect and select the database
        await client.connect();
        console.log('Database connected');
        dbInstance = client.db('deliveryapp'); // Use your actual database name
        return dbInstance;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error; // Rethrow to handle in the calling function
    }
}

// Close the connection when the app shuts down
function closeConnection() {
    if (client) {
        client.close();
        console.log('Database connection closed');
    }
}

module.exports = { connectDB, closeConnection };
