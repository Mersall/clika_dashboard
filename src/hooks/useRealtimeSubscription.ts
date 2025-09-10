import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  queryKey: string[];
  onUpdate?: (payload: any) => void;
}

export function useRealtimeSubscription({
  table,
  event = '*',
  filter,
  queryKey,
  onUpdate,
}: UseRealtimeSubscriptionOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Create channel name based on table and filter
      const channelName = `${table}-${filter || 'all'}-${Date.now()}`;
      
      channel = supabase.channel(channelName);
      
      // Set up the subscription
      const subscription = channel.on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          // Call custom update handler if provided
          if (onUpdate) {
            onUpdate(payload);
          }
          
          // Invalidate the query to refetch data
          queryClient.invalidateQueries({ queryKey });
        }
      );
      
      // Subscribe to the channel
      await channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${table} table updates`);
        }
      });
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        console.log(`Unsubscribing from ${table} table updates`);
        supabase.removeChannel(channel);
      }
    };
  }, [table, event, filter, queryKey, queryClient, onUpdate]);
}