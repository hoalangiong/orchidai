import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface GardenLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface UserProfile {
  gardenLocation?: GardenLocation;
  gardenLocationSetup: boolean;
  activeCrop?: string; // 'orchid' | 'durian' | ... (mặc định 'orchid' cho user cũ)
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'profile', 'data');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Initialize empty profile
          const newProfile: UserProfile = {
            gardenLocationSetup: false,
          };
          setProfile(newProfile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setProfile({ gardenLocationSetup: false });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateGardenLocation = async (location: GardenLocation) => {
    if (!user) return;

    const updatedProfile: UserProfile = {
      gardenLocation: location,
      gardenLocationSetup: true,
    };

    try {
      const docRef = doc(db, 'users', user.uid, 'profile', 'data');
      await setDoc(docRef, updatedProfile, { merge: true });
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating garden location:', error);
      throw error;
    }
  };

  const hasGardenLocation = (): boolean => {
    return profile?.gardenLocationSetup === true && !!profile?.gardenLocation;
  };

  const updateActiveCrop = async (cropId: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'profile', 'data');
      await setDoc(docRef, { activeCrop: cropId }, { merge: true });
      setProfile(prev => ({ ...(prev ?? { gardenLocationSetup: false }), activeCrop: cropId }));
    } catch (error) {
      console.error('Error updating active crop:', error);
      throw error;
    }
  };

  return {
    profile,
    loading,
    updateGardenLocation,
    hasGardenLocation,
    updateActiveCrop,
  };
}
