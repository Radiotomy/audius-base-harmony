import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireArtist?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireArtist = false 
}: ProtectedRouteProps) => {
  const { user, loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Add artist verification check if needed
  if (requireArtist && user) {
    // This would check if user has artist role/permissions
    // For now, we'll allow access but this can be enhanced
  }

  return <>{children}</>;
};

export default ProtectedRoute;