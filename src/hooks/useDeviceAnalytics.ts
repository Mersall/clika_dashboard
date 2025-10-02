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
      try {
        // Fetch sessions with device info
        const { data: sessions, error } = await supabase
          .from('session')
          .select('id, user_id, device_id, started_at, ended_at');

        if (error) {
          console.error('Error fetching device analytics:', error);
          // Return mock data as fallback
          return {
            uniqueDevices: 0,
            sessionsPerDevice: 0,
            crossDeviceUsers: 0,
            deviceTypes: {},
            deviceRetention: {
              day1: 0,
              day7: 0,
              day30: 0
            }
          };
        }

        // Calculate unique devices
        const uniqueDevices = new Set(sessions?.map(s => s.device_id).filter(Boolean)).size;

        // Calculate sessions per device
        const sessionsPerDevice = sessions && uniqueDevices > 0
          ? sessions.length / uniqueDevices
          : 0;

        // Calculate cross-device users (users with multiple devices)
        const userDevices = new Map<string, Set<string>>();
        sessions?.forEach(session => {
          if (session.user_id && session.device_id) {
            if (!userDevices.has(session.user_id)) {
              userDevices.set(session.user_id, new Set());
            }
            userDevices.get(session.user_id)?.add(session.device_id);
          }
        });
        const crossDeviceUsers = Array.from(userDevices.values()).filter(devices => devices.size > 1).length;

        // Categorize device types based on device_id patterns
        const deviceTypes: Record<string, number> = {
          'iOS': 0,
          'Android': 0,
          'Web': 0,
          'Other': 0
        };

        sessions?.forEach(session => {
          if (session.device_id) {
            const deviceId = session.device_id.toLowerCase();
            if (deviceId.includes('ios') || deviceId.includes('iphone') || deviceId.includes('ipad')) {
              deviceTypes['iOS']++;
            } else if (deviceId.includes('android')) {
              deviceTypes['Android']++;
            } else if (deviceId.includes('web') || deviceId.includes('browser')) {
              deviceTypes['Web']++;
            } else {
              deviceTypes['Other']++;
            }
          }
        });

        // Calculate basic retention (simplified - real retention would need cohort analysis)
        const now = new Date();
        const day1Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const day7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const day30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const recentSessions = sessions?.filter(s => new Date(s.started_at) > day1Ago).length || 0;
        const week7Sessions = sessions?.filter(s => new Date(s.started_at) > day7Ago).length || 0;
        const month30Sessions = sessions?.filter(s => new Date(s.started_at) > day30Ago).length || 0;

        const totalSessions = sessions?.length || 1;

        return {
          uniqueDevices,
          sessionsPerDevice: Number(sessionsPerDevice.toFixed(1)),
          crossDeviceUsers,
          deviceTypes: Object.fromEntries(
            Object.entries(deviceTypes).filter(([_, count]) => count > 0)
          ),
          deviceRetention: {
            day1: Number(((recentSessions / totalSessions) * 100).toFixed(1)),
            day7: Number(((week7Sessions / totalSessions) * 100).toFixed(1)),
            day30: Number(((month30Sessions / totalSessions) * 100).toFixed(1))
          }
        } as DeviceAnalytics;
      } catch (err) {
        console.error('Error in device analytics:', err);
        return {
          uniqueDevices: 0,
          sessionsPerDevice: 0,
          crossDeviceUsers: 0,
          deviceTypes: {},
          deviceRetention: {
            day1: 0,
            day7: 0,
            day30: 0
          }
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useUserDevices = () => {
  return useQuery({
    queryKey: ['user-devices'],
    queryFn: async () => {
      try {
        // Fetch all sessions with device info
        const { data: sessions, error } = await supabase
          .from('session')
          .select('user_id, device_id, started_at, ended_at')
          .order('started_at', { ascending: false });

        if (error) {
          console.error('Error fetching user devices:', error);
          return [] as UserDevice[];
        }

        // Group by user and device
        const userDeviceMap = new Map<string, {
          devices: Set<string>,
          sessions: Array<any>,
          firstSeen: Date,
          lastSeen: Date
        }>();

        sessions?.forEach(session => {
          if (session.user_id && session.device_id) {
            const key = `${session.user_id}|||${session.device_id}`;

            if (!userDeviceMap.has(key)) {
              userDeviceMap.set(key, {
                devices: new Set(),
                sessions: [],
                firstSeen: new Date(session.started_at),
                lastSeen: new Date(session.started_at)
              });
            }

            const data = userDeviceMap.get(key)!;
            data.devices.add(session.device_id);
            data.sessions.push(session);

            const sessionDate = new Date(session.started_at);
            if (sessionDate < data.firstSeen) data.firstSeen = sessionDate;
            if (sessionDate > data.lastSeen) data.lastSeen = sessionDate;
          }
        });

        // Calculate device count per user
        const userDeviceCounts = new Map<string, number>();
        sessions?.forEach(session => {
          if (session.user_id) {
            const devices = new Set(
              sessions
                .filter(s => s.user_id === session.user_id)
                .map(s => s.device_id)
                .filter(Boolean)
            );
            userDeviceCounts.set(session.user_id, devices.size);
          }
        });

        // Convert to UserDevice array
        const userDevices: UserDevice[] = [];
        userDeviceMap.forEach((data, key) => {
          const [userId, deviceId] = key.split('|||');

          userDevices.push({
            user_id: userId,
            device_id: deviceId,
            device_count: userDeviceCounts.get(userId) || 1,
            first_seen: data.firstSeen.toISOString(),
            last_seen: data.lastSeen.toISOString(),
            total_sessions: data.sessions.length
          });
        });

        // Sort by total sessions and take top 10
        return userDevices
          .sort((a, b) => b.total_sessions - a.total_sessions)
          .slice(0, 10);
      } catch (err) {
        console.error('Error fetching user devices:', err);
        return [] as UserDevice[];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useDeviceSessions = () => {
  return useQuery({
    queryKey: ['device-sessions'],
    queryFn: async () => {
      try {
        // Fetch all sessions with device info
        const { data: sessions, error } = await supabase
          .from('session')
          .select('device_id, user_id, started_at, ended_at');

        if (error) {
          console.error('Error fetching device sessions:', error);
          return [] as DeviceSession[];
        }

        // Group by device
        const deviceMap = new Map<string, {
          users: Set<string>,
          sessions: Array<any>,
          totalDuration: number,
          lastActivity: Date
        }>();

        sessions?.forEach(session => {
          if (session.device_id) {
            if (!deviceMap.has(session.device_id)) {
              deviceMap.set(session.device_id, {
                users: new Set(),
                sessions: [],
                totalDuration: 0,
                lastActivity: new Date(session.started_at)
              });
            }

            const data = deviceMap.get(session.device_id)!;
            if (session.user_id) {
              data.users.add(session.user_id);
            }
            data.sessions.push(session);

            // Calculate duration if ended_at exists
            if (session.ended_at) {
              const duration = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime();
              data.totalDuration += duration;
            }

            const sessionDate = new Date(session.started_at);
            if (sessionDate > data.lastActivity) {
              data.lastActivity = sessionDate;
            }
          }
        });

        // Convert to DeviceSession array
        const deviceSessions: DeviceSession[] = [];
        deviceMap.forEach((data, deviceId) => {
          const avgDuration = data.sessions.length > 0 && data.totalDuration > 0
            ? data.totalDuration / data.sessions.length / 1000 // Convert to seconds
            : 0;

          deviceSessions.push({
            device_id: deviceId,
            session_count: data.sessions.length,
            user_count: data.users.size,
            avg_session_duration: avgDuration,
            last_activity: data.lastActivity.toISOString()
          });
        });

        // Sort by session count and take top 10
        return deviceSessions
          .sort((a, b) => b.session_count - a.session_count)
          .slice(0, 10);
      } catch (err) {
        console.error('Error fetching device sessions:', err);
        return [] as DeviceSession[];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
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