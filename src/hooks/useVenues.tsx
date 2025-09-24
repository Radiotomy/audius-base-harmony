import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Venue {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  capacity?: number;
  description?: string;
  website_url?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('is_active', true)
        .order('name');

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

  useEffect(() => {
    fetchVenues();
  }, []);

  return {
    venues,
    loading,
    fetchVenues,
  };
};