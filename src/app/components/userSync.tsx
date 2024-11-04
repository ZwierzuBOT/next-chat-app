'use client';
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { firestore } from '../../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const UserSync: React.FC = () => {
  const { user } = useUser();

  useEffect(() => {
    const syncUserData = async () => {
      if (user) {
        const userRef = doc(firestore, 'users', user.id); 

        try {
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              id: user.id,
              email: user.emailAddresses?.[0]?.emailAddress || '', 
              name: user.username || '', 
            });
          }
        } catch (error) {
          console.error('Error syncing user data:', error);
        }
      }
    };

    syncUserData();
  }, [user]);

  return null;
};

export default UserSync;
