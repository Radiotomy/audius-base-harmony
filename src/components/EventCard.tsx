import { Calendar, MapPin, Music, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event } from '@/hooks/useEvents';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  onViewDetails?: (event: Event) => void;
  onPurchaseTicket?: (event: Event) => void;
}

export const EventCard = ({ event, onViewDetails, onPurchaseTicket }: EventCardProps) => {
  const formatEventDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatEventTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500 text-white';
      case 'scheduled':
        return 'bg-green-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      case 'cancelled':
        return 'bg-red-700 text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const isUpcoming = new Date(event.event_date) > new Date();
  const canPurchaseTickets = event.status === 'scheduled' && isUpcoming;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {event.cover_image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
          <Badge className={getStatusColor(event.status)}>
            {event.status}
          </Badge>
        </div>

        {event.profiles?.username && (
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {event.profiles.username}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {formatEventDate(event.event_date)}
          </span>
          {event.start_time && (
            <>
              <Clock className="w-4 h-4 text-muted-foreground ml-2" />
              <span className="text-sm">
                {formatEventTime(event.start_time)}
              </span>
            </>
          )}
        </div>

        {event.venues && (
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {event.venues.name}
              {event.venues.city && `, ${event.venues.city}`}
            </span>
          </div>
        )}

        {event.is_virtual && (
          <Badge variant="secondary" className="mb-2">
            Virtual Event
          </Badge>
        )}

        {event.max_capacity && (
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {event.current_attendance}/{event.max_capacity} attending
            </span>
          </div>
        )}

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {event.description}
          </p>
        )}

        {event.genre && (
          <Badge variant="outline" className="mt-2">
            {event.genre}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails?.(event)}
          className="flex-1"
        >
          View Details
        </Button>
        
        {canPurchaseTickets && event.ticket_price > 0 && (
          <Button
            size="sm"
            onClick={() => onPurchaseTicket?.(event)}
            className="flex-1"
          >
            Buy Ticket - {event.ticket_price} ETH
          </Button>
        )}
        
        {canPurchaseTickets && event.ticket_price === 0 && (
          <Button
            size="sm"
            onClick={() => onPurchaseTicket?.(event)}
            className="flex-1"
          >
            Get Free Ticket
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};