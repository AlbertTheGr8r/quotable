import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyProfile {
  name: string;
  address: string;
  contact: string;
  email: string;
  website: string;
  logoId: string | null;
}

interface CompanyStore {
  profile: CompanyProfile;
  setProfile: (profile: Partial<CompanyProfile>) => void;
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      profile: {
        name: '',
        address: '',
        contact: '',
        email: '',
        website: '',
        logoId: 'primary-logo'
      },
      setProfile: (newProfile) =>
        set((state) => ({
          profile: { ...state.profile, ...newProfile },
        })),
    }),
    {
      name: 'company-storage',
    }
  )
);
