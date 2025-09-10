import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export interface UserLocation {
  user_id: string;
  city_id: number | null;
  country_code: string | null;
  geo_consent: boolean | null;
  personalized_ads: boolean | null;
  last_geo_at: string | null;
  last_geohash5: string | null;
  display_name?: string | null;
}

export interface LocationStats {
  totalUsers: number;
  usersWithLocation: number;
  geoConsentGiven: number;
  adsConsentGiven: number;
  countryDistribution: Record<string, number>;
  consentTrends: {
    date: string;
    geoConsent: number;
    adsConsent: number;
  }[];
}

export const useUserLocations = () => {
  return useQuery({
    queryKey: ['user-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .order('last_geo_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching user locations:', error);
        toast.error('Failed to fetch user locations');
        throw error;
      }

      return data as UserLocation[];
    },
  });
};

export const useLocationStats = () => {
  return useQuery({
    queryKey: ['location-stats'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('user_profile')
        .select('*');

      if (error) {
        console.error('Error fetching location stats:', error);
        toast.error('Failed to fetch location statistics');
        throw error;
      }

      // Calculate statistics
      const totalUsers = profiles.length;
      const usersWithLocation = profiles.filter(p => p.country_code || p.city_id || p.last_geohash5).length;
      const geoConsentGiven = profiles.filter(p => p.geo_consent === true).length;
      const adsConsentGiven = profiles.filter(p => p.personalized_ads === true).length;

      // Country distribution
      const countryDistribution: Record<string, number> = {};
      profiles.forEach(profile => {
        if (profile.country_code) {
          countryDistribution[profile.country_code] = (countryDistribution[profile.country_code] || 0) + 1;
        }
      });

      // For demo purposes, generate some sample trend data
      const consentTrends = generateConsentTrends();

      return {
        totalUsers,
        usersWithLocation,
        geoConsentGiven,
        adsConsentGiven,
        countryDistribution,
        consentTrends,
      } as LocationStats;
    },
  });
};

// Helper function to generate demo trend data
function generateConsentTrends() {
  const trends = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      geoConsent: Math.floor(20 + Math.random() * 30 + (30 - i) * 0.5),
      adsConsent: Math.floor(15 + Math.random() * 25 + (30 - i) * 0.4),
    });
  }
  
  return trends;
}

// Get country name from code
export function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    'US': 'United States',
    'EG': 'Egypt',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'CA': 'Canada',
    'AU': 'Australia',
    'JP': 'Japan',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    // Add more as needed
  };
  
  return countries[code] || code;
}