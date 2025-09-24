import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, Play, Shuffle, Share, MoreHorizontal, Users, 
  Trash2, Edit, Copy, Download, Lock, Unlock, Eye 
} from 'lucide-react';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useAuth } from '@/hooks/useAuth';
import { usePlayer } from '@/contexts/PlayerContext';
import { useToast } from '@/hooks/use-toast';

interface AdvancedPlaylistManagerProps {
  className?: string;
}

const AdvancedPlaylistManager: React.FC<AdvancedPlaylistManagerProps> = ({
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const player = usePlayer();
  const { 
    playlists, 
    createPlaylist, 
    deletePlaylist, 
    loading 
  } = usePlaylists();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<any>(null);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    isPublic: false,
    isCollaborative: false,
  });

  const handleCreatePlaylist = async () => {
    if (!newPlaylist.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a playlist name",
        variant: "destructive",
      });
      return;
    }

    const success = await createPlaylist(
      newPlaylist.name,
      newPlaylist.description || undefined,
      newPlaylist.isPublic
    );

    if (success) {
      setShowCreateDialog(false);
      setNewPlaylist({ name: '', description: '', isPublic: false, isCollaborative: false });
      toast({
        title: "Playlist Created",
        description: `Successfully created "${newPlaylist.name}"`,
      });
    }
  };

  const handlePlayPlaylist = async (playlist: any) => {
    // Mock functionality - in real app would fetch tracks
    toast({
      title: "Playing Playlist",
      description: `Now playing "${playlist.name}"`,
    });
  };

  const handleDeletePlaylist = async (playlistId: string, playlistName: string) => {
    const success = await deletePlaylist(playlistId);
    if (success) {
      toast({
        title: "Playlist Deleted",
        description: `Successfully deleted "${playlistName}"`,
      });
    }
  };

  const formatTrackCount = (count: number) => {
    if (count === 0) return 'Empty';
    if (count === 1) return '1 track';
    return `${count} tracks`;
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to manage playlists</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Playlists
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary">
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
                <DialogDescription>
                  Create a personalized playlist to organize your favorite tracks
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Playlist Name</Label>
                  <Input
                    id="name"
                    placeholder="My Awesome Playlist"
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your playlist..."
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public">Make Public</Label>
                    <Switch
                      id="public"
                      checked={newPlaylist.isPublic}
                      onCheckedChange={(checked) => setNewPlaylist(prev => ({ ...prev, isPublic: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="collaborative">Allow Collaboration</Label>
                    <Switch
                      id="collaborative"
                      checked={newPlaylist.isCollaborative}
                      onCheckedChange={(checked) => setNewPlaylist(prev => ({ ...prev, isCollaborative: checked }))}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleCreatePlaylist}
                  disabled={loading || !newPlaylist.name.trim()}
                  className="w-full"
                >
                  Create Playlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading playlists...</p>
            </div>
          ) : playlists.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No playlists yet</p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Your First Playlist
              </Button>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent group transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{playlist.name}</h3>
                      <div className="flex gap-1">
                        {playlist.is_public && (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {playlist.description || formatTrackCount(0)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => handlePlayPlaylist(playlist)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePlayPlaylist(playlist)}>
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shuffle className="h-4 w-4 mr-2" />
                          Shuffle Play
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setEditingPlaylist(playlist)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeletePlaylist(playlist.id, playlist.name)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdvancedPlaylistManager;