const { MongoClient } = require('mongodb');

const connectionStrings = [
  'mongodb://localhost:27017/talentfc',
  'mongodb://mongo:27017/talentfc',
];

async function testConnection(uri) {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
  });

  try {
    await client.connect();
    const db = client.db('talentfc');
    const collection = db.collection('jogadores');
    const count = await collection.countDocuments();
    const sample = await collection.findOne();

    console.log(`Connection status: Connected (${uri})`);
    console.log(`Count of documents: ${count}`);
    console.log('Sample document:', sample ? JSON.stringify(sample, null, 2) : 'None');
    return true;
  } catch (error) {
    console.log(`Connection status: Failed (${uri}) - ${error.message}`);
    return false;
  } finally {
    await client.close();
  }
}

(async () => {
  for (const uri of connectionStrings) {
    if (await testConnection(uri)) return;
  }
  console.error('MongoDB connection failed for all configured connection strings.');
  process.exitCode = 1;
})();
