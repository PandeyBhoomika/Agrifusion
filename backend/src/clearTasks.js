import mongoose from 'mongoose';
import 'dotenv/config';

await mongoose.connect(process.env.MONGO_URI);

// Clear stale UserCropTask rows
const uct = await mongoose.connection.collection('usercroptasks').deleteMany({});
console.log('Deleted UserCropTask rows:', uct.deletedCount);

// Clear duplicate Tasks (will be re-seeded cleanly)
const tasks = await mongoose.connection.collection('tasks').deleteMany({});
console.log('Deleted Task rows:', tasks.deletedCount);

await mongoose.disconnect();