import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  title: string;
  description: string;
  artist_id: string;
  venue_id?: string;
  event_date: string;
  door_time?: string;
  start_time?: string;
  end_time?: string;
  ticket_price: number;
  max_capacity?: number;
  current_attendance: number;
  event_type: string;
  status: string;
  is_virtual: boolean;
  stream_url?: string;
  cover_image_url?: string;
  genre?: string;
  age_restriction?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  venues?: {
    id: string;
    name: string;
    city?: string;
  };
  profiles?: {
    id: string;
    username?: string;
    avatar_url?: string;
  } | null;
}

export interface CreateEventData {
  title: string;
  description: string;
  venue_id?: string;
  event_date: string;
  door_time?: string;
  start_time?: string;
  end_time?: string;
  ticket_price: number;
  max_capacity?: number;
  event_type: string;
  is_virtual: boolean;
  stream_url?: string;
  cover_image_url?: string;
  genre?: string;
  age_restriction?: string;
  tags?: string[];
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async (filters?: {
    status?: string;
    event_type?: string;
    artist_id?: string;
    upcoming_only?: boolean;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select(`
          *,
          venues (
            id,
            name,
            city
          ),
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .order('event_date', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.event_type) {
        query = query.eq('event_type', filters.event_type);
      }

      if (filters?.artist_id) {
        query = query.eq('artist_id', filters.artist_id);
      }

      if (filters?.upcoming_only) {
        query = query.gte('event_date', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setEvents((data as any) || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: CreateEventData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          artist_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      await fetchEvents();
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<CreateEventData>) => {
    try {
      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event updated successfully",
      });

      await fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents({ upcoming_only: true });
  }, []);

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};