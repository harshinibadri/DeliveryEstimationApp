const mongoose = require('mongoose');

async function getAllDocuments(collectionName) {
    try {
        const collection = mongoose.connection.collection(collectionName);
        const documents = await collection.find({}).toArray();
        return documents;
    } catch (error) {
        throw new Error(`Error fetching documents from ${collectionName}: ${error.message}`);
    }
}

module.exports = { getAllDocuments };
