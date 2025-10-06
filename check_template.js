// Quick script to check your template in the database
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongo-uri-here';

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const Template = mongoose.model('Template', new mongoose.Schema({}, { strict: false }));
  const templates = await Template.find({ isPublic: true }).limit(5);
  
  console.log('\n=== Published Templates ===');
  templates.forEach(t => {
    console.log(`\nTitle: ${t.title}`);
    console.log(`Category: "${t.category}" (type: ${typeof t.category})`);
    console.log(`Channel: ${t.channelName}`);
    console.log(`Public: ${t.isPublic}`);
  });
  
  console.log(`\n\nTotal public templates: ${templates.length}`);
  
  await mongoose.disconnect();
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
