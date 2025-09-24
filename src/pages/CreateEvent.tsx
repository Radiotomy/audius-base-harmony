import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Calendar, MapPin, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useEvents, CreateEventData } from '@/hooks/useEvents';
import { useVenues } from '@/hooks/useVenues';
import { useToast } from '@/hooks/use-toast';

const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  event_date: z.string().min(1, 'Event date is required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  door_time: z.string().optional(),
  ticket_price: z.number().min(0, 'Ticket price must be 0 or greater'),
  max_capacity: z.number().optional(),
  event_type: z.string().min(1, 'Event type is required'),
  genre: z.string().optional(),
  age_restriction: z.string().optional(),
  is_virtual: z.boolean(),
  venue_id: z.string().optional(),
  stream_url: z.string().url().optional().or(z.literal("")),
  cover_image_url: z.string().url().optional().or(z.literal("")),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

export const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createEvent } = useEvents();
  const { venues } = useVenues();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      end_time: '',
      door_time: '',
      ticket_price: 0,
      event_type: 'concert',
      is_virtual: false,
      stream_url: '',
      cover_image_url: '',
    },
  });

  const isVirtual = form.watch('is_virtual');

  const onSubmit = async (data: CreateEventFormData) => {
    setIsSubmitting(true);
    try {
      const eventData: CreateEventData = {
        ...data,
        tags: data.genre ? [data.genre] : [],
      };

      await createEvent(eventData);
      
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/events')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create New Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your event..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="event_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="concert">Concert</SelectItem>
                            <SelectItem value="festival">Festival</SelectItem>
                            <SelectItem value="virtual">Virtual Show</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="meetup">Meet & Greet</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Hip Hop, Electronic" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Date & Time
                </h3>

                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="door_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doors Open (Optional)</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time (Optional)</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time (Optional)</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Virtual Event Toggle */}
              <FormField
                control={form.control}
                name="is_virtual"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Virtual Event</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        This event will be streamed online
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Location/Venue */}
              {!isVirtual ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Venue
                  </h3>

                  <FormField
                    control={form.control}
                    name="venue_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Venue (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a venue" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {venues.map((venue) => (
                              <SelectItem key={venue.id} value={venue.id}>
                                {venue.name} - {venue.city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="stream_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stream URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://your-stream-platform.com/stream"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Ticketing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Ticketing
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ticket_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Price (ETH)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.05"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Capacity (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            placeholder="100"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="age_restriction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Restriction (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select age restriction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all_ages">All Ages</SelectItem>
                          <SelectItem value="18+">18+</SelectItem>
                          <SelectItem value="21+">21+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Media (Optional)</h3>
                
                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/event-cover.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/events')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};