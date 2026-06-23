import { connectDB } from './config/database.js';
import groq from './config/groq.js';
import admin from './config/firebase.js';

async function test() {
  console.log('=== RUNNING CONNECTIVITY TESTS ===');
  
  // 1. Firebase Admin Auth
  try {
    const listUsersResult = await admin.auth().listUsers(1);
    console.log('✅ Firebase Admin SDK: SUCCESS (Connected and queryable)');
  } catch (e) {
    console.error('❌ Firebase Admin SDK: FAILED', e.message);
  }

  // 2. Groq AI API
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello in 3 words' }],
      model: 'llama-3.3-70b-versatile',
    });
    console.log('✅ Groq AI API: SUCCESS (Response:', chatCompletion.choices[0].message.content.trim(), ')');
  } catch (e) {
    console.error('❌ Groq AI API: FAILED', e.message);
  }

  // 3. MongoDB connection
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB Database: SUCCESS');
    process.exit(0);
  } catch (e) {
    console.error('❌ MongoDB Database: FAILED', e.message);
    process.exit(1);
  }
}

test();
