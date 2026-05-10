const admin = require('firebase-admin');

// No service account needed if we just want to see if we can talk to the project
// but for auth creation we might need it.
// However, we can try to use application default credentials.

const projectId = 'project-x-f46f0';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: projectId
  });
}

async function checkAuthConfig() {
  try {
    console.log('Checking Auth Config for project:', projectId);
    // Try to list users to see if we have access
    const listUsers = await admin.auth().listUsers(1);
    console.log('Successfully connected to Auth. User count >=', listUsers.users.length);
    
    // We can't easily check providers via Admin SDK without specific APIs
    // but we can check if a user with a password exists.
    const testUser = listUsers.users.find(u => u.passwordHash);
    if (testUser) {
      console.log('Found at least one user with a password. Email/Password provider likely enabled.');
    } else {
      console.log('No password users found in the sample. Check Firebase Console.');
    }
  } catch (error) {
    console.error('Error checking auth:', error.message);
  }
}

checkAuthConfig();
