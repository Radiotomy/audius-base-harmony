import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireArtist?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireArtist = false,
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [roleLoading, setRoleLoading] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user || (!requireArtist && !requireAdmin)) {
        setHasRequiredRole(true);
        return;
      }

      setRoleLoading(true);
      try {
        let requiredRole = '';
        if (requireAdmin) requiredRole = 'admin';
        else if (requireArtist) requiredRole = 'artist';

        if (requiredRole) {
          const { data, error } = await supabase.rpc('has_role', {
            _user_id: user.id,
            _role: requiredRole
          });

          if (error) {
            console.error('Error checking user role:', error);
            setHasRequiredRole(false);
          } else {
            setHasRequiredRole(data || false);
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setHasRequiredRole(false);
      } finally {
        setRoleLoading(false);
      }
    };

    checkUserRole();
  }, [user, requireArtist, requireAdmin]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if ((requireArtist || requireAdmin) && user && !hasRequiredRole) {
    return <Navigate to="/auth" state={{ 
      from: location, 
      error: 'Insufficient permissions' 
    }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;