import { auth } from '../config/firebaseConfig';

export const bootstrapAdmin = async (): Promise<void> => {
  try {
    // Create admin user with custom claims
    const adminEmail = 'admin@pixell-river.com';
    const adminPassword = 'Admin123!'; // In production, this should be handled securely

    // Note: In a real application, you would create the user through Firebase Auth
    // and then set custom claims. For bootstrap purposes, we'll assume the user exists.

    // Set custom claims for admin
    const adminUid = 'admin-uid'; // Replace with actual UID from Firebase
    await auth.setCustomUserClaims(adminUid, { role: 'admin' });

    console.log('Admin user bootstrapped successfully');
  } catch (error) {
    console.error('Error bootstrapping admin:', error);
  }
};

// For officer and manager, you would do similar setup
export const bootstrapOfficer = async (uid: string): Promise<void> => {
  await auth.setCustomUserClaims(uid, { role: 'officer' });
};

export const bootstrapManager = async (uid: string): Promise<void> => {
  await auth.setCustomUserClaims(uid, { role: 'manager' });
};