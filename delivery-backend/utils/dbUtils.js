// In utils/dbUtils.js
async function getAllDocuments(collectionName) {
    try {
        const db = mongoose.connection;
        const collection = db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        console.log(`Documents fetched from ${collectionName}:`, documents);
        return documents;
    } catch (error) {
        console.error(`Error fetching documents from ${collectionName}:`, error.message);
        throw error;
    }
}
