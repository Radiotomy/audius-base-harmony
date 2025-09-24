import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'fan' | 'artist' | 'admin';

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('fan'); // Default to fan if no role found
        } else {
          setRole(data?.role || 'fan');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('fan');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    
    // Admin has access to everything
    if (role === 'admin') return true;
    
    // Artist has access to fan features too
    if (role === 'artist' && requiredRole === 'fan') return true;
    
    // Exact role match
    return role === requiredRole;
  };

  const isArtist = () => hasRole('artist');
  const isAdmin = () => hasRole('admin');
  const isFan = () => role === 'fan';

  return {
    role,
    loading,
    hasRole,
    isArtist,
    isAdmin,
    isFan,
  };
};