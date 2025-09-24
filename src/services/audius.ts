// Audius API service layer
const AUDIUS_DISCOVERY_NODES = [
  'https://discoveryprovider.audius.co',
  'https://discoveryprovider2.audius.co',
  'https://discoveryprovider3.audius.co',
];

let currentNodeIndex = 0;

const getDiscoveryNode = () => {
  return AUDIUS_DISCOVERY_NODES[currentNodeIndex];
};

const makeRequest = async (endpoint: string, params: Record<string, any> = {}) => {
  const url = new URL(endpoint, getDiscoveryNode());
  
  // Add common parameters
  url.searchParams.append('app_name', 'AudioBASE');
  
  // Add custom parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // Try next discovery node on failure
    currentNodeIndex = (currentNodeIndex + 1) % AUDIUS_DISCOVERY_NODES.length;
    throw error;
  }
};

export interface AudiusTrack {
  id: string;
  title: string;
  user: {
    id: string;
    name: string;
    handle: string;
    profile_picture?: {
      '150x150'?: string;
      '480x480'?: string;
      '1000x1000'?: string;
    };
  };
  duration: number;
  play_count: number;
  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };
  genre?: string;
  created_at: string;
}

export interface AudiusUser {
  id: string;
  name: string;
  handle: string;
  follower_count: number;
  followee_count: number;
  track_count: number;
  playlist_count?: number;
  repost_count?: number;
  supporter_count?: number;
  supporting_count?: number;
  bio?: string;
  location?: string;
  is_verified?: boolean;
  is_deactivated?: boolean;
  twitter_handle?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  website?: string;
  donation?: string;
  artist_pick_track_id?: string;
  does_follow_current_user?: boolean;
  current_user_followee_follow_count?: number;
  profile_picture?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };
  cover_photo?: {
    '640x'?: string;
    '2000x'?: string;
  };
  wallet?: string;
  associated_wallets?: {
    eth?: string;
    sol?: string;
  };
}

export const audiusService = {
  // Get trending tracks
  async getTrendingTracks(limit: number = 10, offset: number = 0): Promise<AudiusTrack[]> {
    try {
      const response = await makeRequest('/v1/tracks/trending', {
        limit,
        offset,
        time: 'week'
      });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch trending tracks:', error);
      return [];
    }
  },

  // Search tracks
  async searchTracks(query: string, limit: number = 10, offset: number = 0): Promise<AudiusTrack[]> {
    try {
      const response = await makeRequest('/v1/tracks/search', {
        query,
        limit,
        offset
      });
      return response.data || [];
    } catch (error) {
      console.error('Failed to search tracks:', error);
      return [];
    }
  },

  // Search users/artists
  async searchUsers(query: string, limit: number = 10, offset: number = 0): Promise<AudiusUser[]> {
    try {
      const response = await makeRequest('/v1/users/search', {
        query,
        limit,
        offset
      });
      return response.data || [];
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  },

  // Get track by ID
  async getTrack(trackId: string): Promise<AudiusTrack | null> {
    try {
      const response = await makeRequest(`/v1/tracks/${trackId}`);
      return response.data || null;
    } catch (error) {
      console.error(`Failed to fetch track ${trackId}:`, error);
      return null;
    }
  },

  // Get user/artist profile
  async getUser(userId: string): Promise<AudiusUser | null> {
    try {
      const response = await makeRequest(`/v1/users/${userId}`);
      console.log('Audius getUser response:', response); // Debug logging
      return response.data || null;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      return null;
    }
  },

  // Get user's tracks
  async getUserTracks(userId: string, limit: number = 10, offset: number = 0): Promise<AudiusTrack[]> {
    try {
      const response = await makeRequest(`/v1/users/${userId}/tracks`, {
        limit,
        offset,
        sort: 'date'
      });
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch tracks for user ${userId}:`, error);
      return [];
    }
  },

  // Get user's playlists (for future use)
  async getUserPlaylists(userId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    try {
      const response = await makeRequest(`/v1/users/${userId}/playlists`, {
        limit,
        offset
      });
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch playlists for user ${userId}:`, error);
      return [];
    }
  },

  // Get user's favorites (for future use)
  async getUserFavorites(userId: string, limit: number = 10, offset: number = 0): Promise<AudiusTrack[]> {
    try {
      const response = await makeRequest(`/v1/users/${userId}/favorites`, {
        limit,
        offset
      });
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch favorites for user ${userId}:`, error);
      return [];
    }
  },

  // Get stream URL for a track
  async getStreamUrl(trackId: string): Promise<string | null> {
    try {
      const streamUrl = `${getDiscoveryNode()}/v1/tracks/${trackId}/stream?app_name=AudioBASE`;
      return streamUrl;
    } catch (error) {
      console.error(`Failed to get stream URL for track ${trackId}:`, error);
      return null;
    }
  },

  // Transform Audius track to our format
  transformTrack(audiusTrack: AudiusTrack) {
    return {
      id: audiusTrack.id,
      title: audiusTrack.title,
      artist_name: audiusTrack.user.name,
      artist_id: audiusTrack.user.id,
      duration: audiusTrack.duration,
      play_count: audiusTrack.play_count,
      artwork_url: audiusTrack.artwork?.['480x480'] || audiusTrack.artwork?.['150x150'],
      stream_url: null, // Will be populated when needed
      cached_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  // Transform Audius user to our artist format
  transformUser(audiusUser: AudiusUser) {
    return {
      id: audiusUser.id,
      name: audiusUser.name,
      followers: audiusUser.follower_count,
      avatar: audiusUser.profile_picture?.['480x480'] || audiusUser.profile_picture?.['150x150'],
      genre: 'Various', // Audius doesn't provide user genre
      topTrack: null // Will be populated separately
    };
  }
};