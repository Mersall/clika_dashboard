import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

export interface DeviceAnalytics {
  uniqueDevices: number;
  sessionsPerDevice: number;
  crossDeviceUsers: number;
  deviceTypes: Record<string, number>;
  deviceRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

export interface UserDevice {
  user_id: string;
  device_id: string;
  device_count: number;
  first_seen: string;
  last_seen: string;
  total_sessions: number;
}

export interface DeviceSession {
  device_id: string;
  session_count: number;
  user_count: number;
  avg_session_duration: number;
  last_activity: string;
}

export const useDeviceAnalytics = () => {
  return useQuery({
    queryKey: ['device-analytics'],
    queryFn: async () => {
      // Since we can't access the database directly, return mock data
      const mockData: DeviceAnalytics = {
        uniqueDevices: 4289,
        sessionsPerDevice: 3.7,
        crossDeviceUsers: 892,
        deviceTypes: {
          'iOS': 2145,
          'Android': 1893,
          'Web': 251
        },
        deviceRetention: {
          day1: 78.5,
          day7: 45.2,
          day30: 28.9
        }
      };
      
      return mockData;
    },
  });
};

export const useUserDevices = () => {
  return useQuery({
    queryKey: ['user-devices'],
    queryFn: async () => {
      // Mock data for user devices
      const mockData: UserDevice[] = [
        {
          user_id: 'user_001',
          device_id: 'device_ios_123',
          device_count: 3,
          first_seen: '2024-01-15T10:00:00Z',
          last_seen: '2024-03-20T15:30:00Z',
          total_sessions: 145
        },
        {
          user_id: 'user_002',
          device_id: 'device_android_456',
          device_count: 1,
          first_seen: '2024-02-01T08:00:00Z',
          last_seen: '2024-03-21T12:15:00Z',
          total_sessions: 89
        },
        {
          user_id: 'user_003',
          device_id: 'device_ios_789',
          device_count: 2,
          first_seen: '2024-01-20T14:00:00Z',
          last_seen: '2024-03-19T18:45:00Z',
          total_sessions: 213
        },
        {
          user_id: 'user_004',
          device_id: 'device_web_101',
          device_count: 1,
          first_seen: '2024-03-01T09:30:00Z',
          last_seen: '2024-03-20T16:20:00Z',
          total_sessions: 42
        },
        {
          user_id: 'user_005',
          device_id: 'device_android_202',
          device_count: 4,
          first_seen: '2023-12-15T11:00:00Z',
          last_seen: '2024-03-21T09:00:00Z',
          total_sessions: 567
        }
      ];
      
      return mockData;
    },
  });
};

export const useDeviceSessions = () => {
  return useQuery({
    queryKey: ['device-sessions'],
    queryFn: async () => {
      // Mock data for device sessions
      const mockData: DeviceSession[] = [
        {
          device_id: 'device_ios_123',
          session_count: 342,
          user_count: 1,
          avg_session_duration: 1250,
          last_activity: '2024-03-20T15:30:00Z'
        },
        {
          device_id: 'device_android_456',
          session_count: 189,
          user_count: 1,
          avg_session_duration: 890,
          last_activity: '2024-03-21T12:15:00Z'
        },
        {
          device_id: 'device_ios_789',
          session_count: 567,
          user_count: 2,
          avg_session_duration: 1580,
          last_activity: '2024-03-19T18:45:00Z'
        },
        {
          device_id: 'device_web_101',
          session_count: 78,
          user_count: 1,
          avg_session_duration: 420,
          last_activity: '2024-03-20T16:20:00Z'
        },
        {
          device_id: 'device_android_202',
          session_count: 892,
          user_count: 3,
          avg_session_duration: 2100,
          last_activity: '2024-03-21T09:00:00Z'
        }
      ];
      
      return mockData;
    },
  });
};

// Get device retention data
export const useDeviceRetention = (deviceType?: string) => {
  return useQuery({
    queryKey: ['device-retention', deviceType],
    queryFn: async () => {
      // Mock retention data by device type
      const baseRetention = {
        'iOS': { day1: 82, day7: 48, day30: 32 },
        'Android': { day1: 75, day7: 42, day30: 26 },
        'Web': { day1: 65, day7: 35, day30: 18 }
      };
      
      if (deviceType && deviceType in baseRetention) {
        return baseRetention[deviceType as keyof typeof baseRetention];
      }
      
      // Return average if no specific device type
      return { day1: 78.5, day7: 45.2, day30: 28.9 };
    },
  });
};