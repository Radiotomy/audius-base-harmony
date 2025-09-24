import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Music, 
  Play, 
  Pause,
  Edit, 
  Trash2, 
  MoreVertical,
  Search,
  Filter,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  BarChart3,
  Upload
} from 'lucide-react';
import { useArtistUploads, ArtistUpload } from '@/hooks/useArtistUploads';
import { TrackUploadDialog } from '@/components/TrackUploadDialog';
import { formatDistanceToNow } from 'date-fns';

interface TrackManagerProps {
  onTrackSelect?: (track: ArtistUpload) => void;
}

type FilterStatus = 'all' | 'published' | 'draft' | 'processing';
type SortBy = 'newest' | 'oldest' | 'title' | 'plays';

export const TrackManager: React.FC<TrackManagerProps> = ({ onTrackSelect }) => {
  const { uploads, loading, deleteUpload, publishUpload, unpublishUpload, getUploadStats } = useArtistUploads();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<ArtistUpload | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const stats = getUploadStats();

  // Filter and sort tracks
  const filteredTracks = uploads
    .filter(track => {
      const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           track.genre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || track.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'oldest':
          return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'plays':
          return (b.play_count || 0) - (a.play_count || 0);
        default:
          return 0;
      }
    });

  const handleTrackSelect = (trackId: string) => {
    const newSelection = new Set(selectedTracks);
    if (newSelection.has(trackId)) {
      newSelection.delete(trackId);
    } else {
      newSelection.add(trackId);
    }
    setSelectedTracks(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedTracks.size === filteredTracks.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(filteredTracks.map(track => track.id)));
    }
  };

  const handleDeleteTrack = (track: ArtistUpload) => {
    setTrackToDelete(track);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (trackToDelete) {
      await deleteUpload(trackToDelete.id);
      setDeleteDialogOpen(false);
      setTrackToDelete(null);
    }
  };

  const handlePlayPause = (trackId: string) => {
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(trackId);
    }
  };

  const getStatusColor = (status: ArtistUpload['status']) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'processing':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleBatchAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    const selectedTrackIds = Array.from(selectedTracks);
    
    switch (action) {
      case 'publish':
        for (const trackId of selectedTrackIds) {
          await publishUpload(trackId);
        }
        break;
      case 'unpublish':
        for (const trackId of selectedTrackIds) {
          await unpublishUpload(trackId);
        }
        break;
      case 'delete':
        for (const trackId of selectedTrackIds) {
          await deleteUpload(trackId);
        }
        break;
    }
    
    setSelectedTracks(new Set());
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tracks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Plays</p>
                <p className="text-2xl font-bold">{stats.totalPlays.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter: {filterStatus}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                All Tracks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('published')}>
                Published
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('draft')}>
                Drafts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('processing')}>
                Processing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Sort: {sortBy}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('title')}>
                Title A-Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('plays')}>
                Most Plays
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          {selectedTracks.size > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBatchAction('publish')}>
                <Eye className="h-4 w-4 mr-1" />
                Publish ({selectedTracks.size})
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBatchAction('unpublish')}>
                <EyeOff className="h-4 w-4 mr-1" />
                Unpublish
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleBatchAction('delete')}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
          
          <TrackUploadDialog>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Track
            </Button>
          </TrackUploadDialog>
        </div>
      </div>

      {/* Track List */}
      {filteredTracks.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No tracks found</h3>
              <p className="mb-4">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Upload your first track to get started'
                }
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <TrackUploadDialog>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your First Track
                  </Button>
                </TrackUploadDialog>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedTracks.size === filteredTracks.length && filteredTracks.length > 0}
              onChange={handleSelectAll}
              className="rounded"
            />
            <span className="text-sm text-muted-foreground">
              Select all ({filteredTracks.length} tracks)
            </span>
          </div>

          {/* Track Cards */}
          {filteredTracks.map((track) => (
            <Card key={track.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedTracks.has(track.id)}
                    onChange={() => handleTrackSelect(track.id)}
                    className="rounded"
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlayPause(track.id)}
                    className="w-10 h-10 rounded-full"
                  >
                    {currentlyPlaying === track.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  {track.artwork_url && (
                    <img 
                      src={track.artwork_url} 
                      alt={track.title}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground truncate">
                          {track.title}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {track.genre} • {formatDistanceToNow(new Date(track.created_at || ''), { addSuffix: true })}
                        </p>
                        {track.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {track.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(track.status)}>
                          {track.status}
                        </Badge>
                        
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{track.play_count || 0} plays</p>
                          <p>{track.download_count || 0} downloads</p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onTrackSelect?.(track)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Track
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {track.status === 'published' ? (
                              <DropdownMenuItem onClick={() => unpublishUpload(track.id)}>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Unpublish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => publishUpload(track.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTrack(track)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Track</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{trackToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};