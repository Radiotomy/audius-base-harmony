import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventTicket {
  id: string;
  event_id: string;
  user_id: string;
  ticket_type: string;
  price: number;
  currency: string;
  purchase_hash?: string;
  ticket_number?: string;
  qr_code?: string;
  status: string;
  purchased_at: string;
  used_at?: string;
  metadata?: any;
  events?: {
    id: string;
    title: string;
    event_date: string;
    venue_id?: string;
    venues?: {
      name: string;
      address?: string;
    };
  };
}

export interface PurchaseTicketData {
  event_id: string;
  ticket_type: string;
  price: number;
  currency: string;
  purchase_hash?: string;
}

export const useTickets = () => {
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('event_tickets')
        .select(`
          *,
          events (
            id,
            title,
            event_date,
            venue_id,
            venues (
              name,
              address
            )
          )
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;

      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const purchaseTicket = async (ticketData: PurchaseTicketData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate unique ticket number
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { data, error } = await supabase
        .from('event_tickets')
        .insert([{
          ...ticketData,
          user_id: user.id,
          ticket_number: ticketNumber,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ticket purchased successfully",
      });

      await fetchUserTickets();
      return data;
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      toast({
        title: "Error",
        description: "Failed to purchase ticket",
        variant: "destructive",
      });
      throw error;
    }
  };

  const useTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('event_tickets')
        .update({
          status: 'used',
          used_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .eq('status', 'valid');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ticket validated successfully",
      });

      await fetchUserTickets();
    } catch (error) {
      console.error('Error using ticket:', error);
      toast({
        title: "Error",
        description: "Failed to validate ticket",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, []);

  return {
    tickets,
    loading,
    fetchUserTickets,
    purchaseTicket,
    useTicket,
  };
};