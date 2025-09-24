import React, { useState } from 'react';
import { Plus, Filter, Search, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventCard } from '@/components/EventCard';
import { useEvents, Event } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTickets } from '@/hooks/useTickets';
import { useNavigate } from 'react-router-dom';
import SkeletonCard from '@/components/SkeletonCard';

export const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isArtist, isAdmin } = useUserRole();
  const { events, loading } = useEvents();
  const { purchaseTicket } = useTickets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venues?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.genre?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = eventTypeFilter === 'all' || event.event_type === eventTypeFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const upcomingEvents = filteredEvents.filter(event => 
    new Date(event.event_date) > new Date() && event.status === 'scheduled'
  );

  const liveEvents = filteredEvents.filter(event => event.status === 'live');

  const handleViewDetails = (event: Event) => {
    navigate(`/events/${event.id}`);
  };

  const handlePurchaseTicket = async (event: Event) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      await purchaseTicket({
        event_id: event.id,
        ticket_type: 'general',
        price: event.ticket_price,
        currency: 'ETH',
      });
    } catch (error) {
      console.error('Error purchasing ticket:', error);
    }
  };

  const handleCreateEvent = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/events/create');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">
            Discover live music events and concerts
          </p>
        </div>
        
        {(isArtist() || isAdmin()) && (
          <Button onClick={handleCreateEvent} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search events, artists, venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="concert">Concert</SelectItem>
                <SelectItem value="festival">Festival</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Event Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Events ({filteredEvents.length})</TabsTrigger>
          <TabsTrigger value="live">
            Live Now ({liveEvents.length})
            {liveEvents.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white animate-pulse">LIVE</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || eventTypeFilter !== 'all' || statusFilter !== 'all'
                    ? "Try adjusting your search criteria"
                    : "Be the first to create an event!"}
                </p>
                {(isArtist() || isAdmin()) && (
                  <Button onClick={handleCreateEvent}>
                    Create Event
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                  onPurchaseTicket={handlePurchaseTicket}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="live" className="mt-6">
          {liveEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-white rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-lg font-semibold mb-2">No live events</h3>
                <p className="text-muted-foreground">
                  Check back later for live streams and events
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                  onPurchaseTicket={handlePurchaseTicket}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                <p className="text-muted-foreground mb-4">
                  No events scheduled at the moment
                </p>
                {(isArtist() || isAdmin()) && (
                  <Button onClick={handleCreateEvent}>
                    Create Event
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                  onPurchaseTicket={handlePurchaseTicket}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};