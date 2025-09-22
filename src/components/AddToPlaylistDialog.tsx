import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Music, ListMusic } from 'lucide-react';
import { usePlaylists } from '@/hooks/usePlaylists';

interface AddToPlaylistDialogProps {
  trackId: string;
  children?: React.ReactNode;
}

const AddToPlaylistDialog: React.FC<AddToPlaylistDialogProps> = ({ trackId, children }) => {
  const [open, setOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const { playlists, createPlaylist, addTrackToPlaylist, loading } = usePlaylists();

  const handleCreateAndAdd = async () => {
    if (!newPlaylistName.trim()) return;
    
    setCreating(true);
    const playlist = await createPlaylist(newPlaylistName, newPlaylistDescription, isPublic);
    
    if (playlist) {
      await addTrackToPlaylist(playlist.id, trackId);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setIsPublic(false);
      setShowCreateForm(false);
      setOpen(false);
    }
    setCreating(false);
  };

  const handleAddToExisting = async (playlistId: string) => {
    const success = await addTrackToPlaylist(playlistId, trackId);
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListMusic className="h-5 w-5" />
            Add to Playlist
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Playlist */}
          <div>
            {!showCreateForm ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Playlist
              </Button>
            ) : (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="name">Playlist Name</Label>
                  <Input
                    id="name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="My Awesome Playlist"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    placeholder="A collection of my favorite tracks..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public">Make playlist public</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateAndAdd}
                    disabled={!newPlaylistName.trim() || creating}
                    className="flex-1"
                  >
                    Create & Add
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewPlaylistName('');
                      setNewPlaylistDescription('');
                      setIsPublic(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Playlists */}
          {playlists.length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Add to Existing Playlist
                </Label>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {playlists.map((playlist) => (
                      <Button
                        key={playlist.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3"
                        onClick={() => handleAddToExisting(playlist.id)}
                        disabled={loading}
                      >
                        <Music className="h-4 w-4 mr-3 text-muted-foreground" />
                        <div className="text-left">
                          <div className="font-medium">{playlist.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {playlist.track_count || 0} tracks
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          {playlists.length === 0 && !showCreateForm && (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No playlists yet</p>
              <p className="text-sm">Create your first playlist above</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToPlaylistDialog;
