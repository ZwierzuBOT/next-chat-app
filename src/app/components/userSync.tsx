'use client';
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react'; 
import { useAuth } from '@clerk/nextjs';
import { firestore } from '../../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const auth = getAuth();

const UserSync: React.FC = () => {
  const { user } = useUser(); 
  const { getToken } = useAuth(); 

  useEffect(() => {
    const syncUserData = async () => {
      if (user) {
        try {
          const token = await getToken({ template: 'integration_firebase' });

          if (token) {
            await signInWithCustomToken(auth, token);
            
            const userRef = doc(firestore, 'users', user.id);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
              const email = user.emailAddresses?.[0]?.emailAddress || '';
              const username = user.username || '';

              await setDoc(userRef, {
                id: user.id,
                email,
                name: username,
              });
              console.log('User data synced:', { id: user.id, email, name: username });
            } else {
              console.log('User data already exists:', userSnap.data());
            }
          } else {
            console.error('Unable to get Clerk token.');
          }
        } catch (error) {
          console.error('Error syncing user data:', error);
        }
      }
    };

    syncUserData();
  }, [user, getToken]);

  return null;
};

export default UserSync;
