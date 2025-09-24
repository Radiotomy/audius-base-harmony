import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { 
  Album, 
  Music, 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  Play,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  Upload
} from 'lucide-react';
import { useAlbums, Album as AlbumType } from '@/hooks/useAlbums';
import { useArtistUploads } from '@/hooks/useArtistUploads';
import { AlbumCreationDialog } from '@/components/AlbumCreationDialog';
import { formatDistanceToNow } from 'date-fns';

interface AlbumManagerProps {
  onAlbumSelect?: (album: AlbumType) => void;
}

export const AlbumManager: React.FC<AlbumManagerProps> = ({ onAlbumSelect }) => {
  const { albums, loading, deleteAlbum, publishAlbum, unpublishAlbum, addTrackToAlbum, removeTrackFromAlbum, reorderAlbumTracks } = useAlbums();
  const { uploads } = useArtistUploads();
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumType | null>(null);
  const [trackDialogOpen, setTrackDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get available tracks (not in current album)
  const availableTracks = uploads.filter(track => 
    !selectedAlbum?.tracks?.some(albumTrack => albumTrack.track_id === track.id)
  );

  const filteredTracks = availableTracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !selectedAlbum) return;

    const tracks = Array.from(selectedAlbum.tracks || []);
    const [reorderedTrack] = tracks.splice(result.source.index, 1);
    tracks.splice(result.destination.index, 0, reorderedTrack);

    // Update track numbers
    const trackOrders = tracks.map((track, index) => ({
      trackId: track.track_id,
      trackNumber: index + 1,
    }));

    await reorderAlbumTracks(selectedAlbum.id, trackOrders);
  };

  const handleAddTrack = async (trackId: string) => {
    if (!selectedAlbum) return;

    const trackNumber = (selectedAlbum.tracks?.length || 0) + 1;
    await addTrackToAlbum(selectedAlbum.id, trackId, trackNumber);
    setTrackDialogOpen(false);
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!selectedAlbum) return;
    await removeTrackFromAlbum(selectedAlbum.id, trackId);
  };

  const openTrackDialog = (album: AlbumType) => {
    setSelectedAlbum(album);
    setTrackDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Album Management</h3>
        <AlbumCreationDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Album
          </Button>
        </AlbumCreationDialog>
      </div>

      {albums.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <Album className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No albums yet</h3>
              <p className="mb-4">Create your first album to organize your tracks</p>
              <AlbumCreationDialog>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Album
                </Button>
              </AlbumCreationDialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <Card key={album.id} className="hover:shadow-md transition-shadow">
              {album.cover_art_url && (
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img 
                    src={album.cover_art_url} 
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{album.title}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">
                      {album.album_type} • {album.genre}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(album.created_at || ''), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={album.is_published ? "default" : "secondary"}>
                    {album.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {album.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {album.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Music className="h-4 w-4" />
                      <span>{album.tracks?.length || 0} tracks</span>
                    </div>
                    {album.release_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(album.release_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Track List Preview */}
                  {album.tracks && album.tracks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Tracks:</h4>
                      <div className="space-y-1">
                        {album.tracks.slice(0, 3).map((track) => {
                          const upload = uploads.find(u => u.id === track.track_id);
                          return (
                            <div key={track.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="w-4 text-center">{track.track_number}</span>
                              <span className="flex-1 truncate">
                                {upload?.title || 'Unknown Track'}
                              </span>
                            </div>
                          );
                        })}
                        {album.tracks.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{album.tracks.length - 3} more tracks
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => onAlbumSelect?.(album)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openTrackDialog(album)}>
                      <Music className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => album.is_published ? unpublishAlbum(album.id) : publishAlbum(album.id)}
                    >
                      {album.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteAlbum(album.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Track Management Dialog */}
      <Dialog open={trackDialogOpen} onOpenChange={setTrackDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Tracks - {selectedAlbum?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Tracks */}
            {selectedAlbum?.tracks && selectedAlbum.tracks.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Current Tracks</h4>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="album-tracks">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {selectedAlbum.tracks
                          .sort((a, b) => a.track_number - b.track_number)
                          .map((track, index) => {
                            const upload = uploads.find(u => u.id === track.track_id);
                            return (
                              <Draggable key={track.id} draggableId={track.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`flex items-center gap-3 p-3 bg-accent/30 rounded-lg ${
                                      snapshot.isDragging ? 'shadow-lg' : ''
                                    }`}
                                  >
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <span className="w-6 text-sm text-muted-foreground">
                                      {track.track_number}
                                    </span>
                                    <div className="flex-1">
                                      <p className="font-medium">{upload?.title || 'Unknown Track'}</p>
                                      <p className="text-sm text-muted-foreground capitalize">
                                        {upload?.genre}
                                      </p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveTrack(track.track_id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}

            {/* Add Tracks */}
            <div>
              <h4 className="font-medium mb-3">Add Tracks</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {filteredTracks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {availableTracks.length === 0 
                      ? 'All available tracks are already in this album' 
                      : 'No tracks match your search'
                    }
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredTracks.map((track) => (
                      <div key={track.id} className="flex items-center gap-3 p-2 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{track.title}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {track.genre}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTrack(track.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};