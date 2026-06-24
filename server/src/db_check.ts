import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';

const checkDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lifelink';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const collections = ['users', 'requests', 'donorprofiles', 'hospitalprofiles', 'donationrecords', 'organwaitlists'];
    for (const name of collections) {
      try {
        const count = await mongoose.connection.db!.collection(name).countDocuments();
        console.log(`Collection "${name}": ${count} documents`);
      } catch (err: any) {
        console.log(`Failed to count "${name}": ${err.message}`);
      }
    }

    // Print some sample records from requests
    const reqs = await mongoose.connection.db!.collection('requests').find({}).limit(5).toArray();
    console.log('Sample Requests:');
    console.log(JSON.stringify(reqs, null, 2));

    await mongoose.connection.close();
  } catch (err: any) {
    console.error('Error:', err.message);
  }
};

checkDB();
