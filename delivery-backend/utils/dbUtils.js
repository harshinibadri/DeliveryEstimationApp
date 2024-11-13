const mongoose = require('mongoose');

// General utility function to fetch all documents from a given collection
const getAllDocuments = async (collectionName) => {
    try {
        // Dynamically create the model from the collection name
        const model = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
        const documents = await model.find({});
        return documents;
    } catch (error) {
        console.error(`Error fetching documents from ${collectionName}:`, error.message);
        throw error;
    }
};

module.exports = { getAllDocuments };
