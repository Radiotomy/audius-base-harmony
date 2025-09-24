import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Venue {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVenueData {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  image_url?: string;
}

export const useVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVenues = async (filters?: { city?: string; country?: string }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('venues')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (filters?.city) {
        query = query.eq('city', filters.city);
      }

      if (filters?.country) {
        query = query.eq('country', filters.country);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVenues(data || []);
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast({
        title: "Error",
        description: "Failed to load venues",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createVenue = async (venueData: CreateVenueData) => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .insert([venueData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Venue created successfully",
      });

      await fetchVenues();
      return data;
    } catch (error) {
      console.error('Error creating venue:', error);
      toast({
        title: "Error",
        description: "Failed to create venue",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  return {
    venues,
    loading,
    fetchVenues,
    createVenue,
  };
};