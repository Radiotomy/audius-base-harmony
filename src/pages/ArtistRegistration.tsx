import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useArtistApplication } from '@/hooks/useArtistApplication';
import { ArtistRegistrationForm } from '@/components/ArtistRegistrationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';

export const ArtistRegistration = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const { application, loading, fetchApplication } = useArtistApplication();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchApplication();
    }
  }, [user, authLoading, navigate, fetchApplication]);

  useEffect(() => {
    // If user is already a verified artist, redirect to dashboard
    if (profile?.artist_verified) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const handleRegistrationSuccess = () => {
    fetchApplication(); // Refresh to show the new application status
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'under_review':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'under_review':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // If user has an existing application, show status
  if (application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto py-8">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(application.status)}
                Artist Application Status
              </CardTitle>
              <CardDescription>
                Your artist registration application status and details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={getStatusBadgeVariant(application.status)}>
                  {application.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Application Type:</span>
                  <p className="text-sm text-muted-foreground capitalize">
                    {application.application_type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Submitted:</span>
                  <p className="text-sm text-muted-foreground">
                    {new Date(application.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium">Display Name:</span>
                <p className="text-sm text-muted-foreground">{application.display_name}</p>
              </div>

              <div>
                <span className="text-sm font-medium">Genres:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {application.genres.map((genre) => (
                    <Badge key={genre} variant="outline" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium">Bio:</span>
                <p className="text-sm text-muted-foreground">{application.bio}</p>
              </div>

              {application.admin_notes && (
                <div>
                  <span className="text-sm font-medium">Admin Notes:</span>
                  <p className="text-sm text-muted-foreground">{application.admin_notes}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                {application.status === 'pending' && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Your application is being reviewed. You'll be notified once it's processed.
                    </p>
                    <Button onClick={() => navigate('/')}>
                      Back to Home
                    </Button>
                  </div>
                )}

                {application.status === 'approved' && (
                  <div className="text-center">
                    <p className="text-sm text-green-600 mb-4">
                      Congratulations! Your artist application has been approved.
                    </p>
                    <Button onClick={() => navigate('/dashboard')}>
                      Go to Artist Dashboard
                    </Button>
                  </div>
                )}

                {application.status === 'rejected' && (
                  <div className="text-center">
                    <p className="text-sm text-red-600 mb-4">
                      Unfortunately, your application was not approved at this time.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={() => navigate('/')}>
                        Back to Home
                      </Button>
                      <Button onClick={() => window.location.reload()}>
                        Apply Again
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show registration form for new applications
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto py-8">
        <ArtistRegistrationForm onSuccess={handleRegistrationSuccess} />
      </div>
    </div>
  );
};