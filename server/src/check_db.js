const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://lifelinkai4_db_user:xkRHEHgrr9of64Xo@cluster0.bqwfdqx.mongodb.net/lifelink?retryWrites=true&w=majority';

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');
    
    const collection = mongoose.connection.collection('donorprofiles');
    const indexes = await collection.indexes();
    console.log('Indexes on donorprofiles:', JSON.stringify(indexes, null, 2));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
