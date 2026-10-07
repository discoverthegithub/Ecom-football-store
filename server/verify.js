import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/mt-ecommerce').then(async () => {
  await mongoose.connection.collection('users').updateOne({email:'test3@example.com'}, {$set: {isVerified:true}});
  console.log('verified');
  process.exit(0);
}).catch(console.error);
