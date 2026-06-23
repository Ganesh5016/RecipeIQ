import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// Clean up the private key — Vercel can store it with literal \n or with surrounding quotes
const getPrivateKey = () => {
  let key = process.env.FIREBASE_PRIVATE_KEY || '';
  // Remove surrounding quotes if present (copy-paste artifact)
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1);
  }
  // Replace literal \n with actual newlines
  key = key.replace(/\\n/g, '\n');
  return key;
};

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase env vars:', {
      projectId: !!projectId,
      clientEmail: !!clientEmail,
      privateKey: !!privateKey,
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
    });
  }
}

export default admin;

