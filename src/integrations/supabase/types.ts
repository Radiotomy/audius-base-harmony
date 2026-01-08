export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          activity_data: Json
          activity_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_data: Json
          activity_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_data?: Json
          activity_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      album_tracks: {
        Row: {
          album_id: string
          created_at: string | null
          id: string
          track_id: string
          track_number: number
        }
        Insert: {
          album_id: string
          created_at?: string | null
          id?: string
          track_id: string
          track_number: number
        }
        Update: {
          album_id?: string
          created_at?: string | null
          id?: string
          track_id?: string
          track_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "album_tracks_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "artist_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          album_type: string
          artist_id: string
          cover_art_url: string | null
          created_at: string | null
          description: string | null
          genre: string
          id: string
          is_published: boolean | null
          release_date: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          album_type?: string
          artist_id: string
          cover_art_url?: string | null
          created_at?: string | null
          description?: string | null
          genre: string
          id?: string
          is_published?: boolean | null
          release_date?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          album_type?: string
          artist_id?: string
          cover_art_url?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string
          id?: string
          is_published?: boolean | null
          release_date?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      artist_analytics: {
        Row: {
          artist_id: string
          created_at: string | null
          date: string
          id: string
          new_followers: number | null
          platform: string
          tip_count: number | null
          total_plays: number | null
          total_tips: number | null
          track_shares: number | null
          unique_listeners: number | null
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          date: string
          id?: string
          new_followers?: number | null
          platform: string
          tip_count?: number | null
          total_plays?: number | null
          total_tips?: number | null
          track_shares?: number | null
          unique_listeners?: number | null
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          date?: string
          id?: string
          new_followers?: number | null
          platform?: string
          tip_count?: number | null
          total_plays?: number | null
          total_tips?: number | null
          track_shares?: number | null
          unique_listeners?: number | null
        }
        Relationships: []
      }
      artist_applications: {
        Row: {
          admin_notes: string | null
          application_type: string
          audius_handle: string | null
          audius_user_id: string | null
          bio: string
          created_at: string | null
          display_name: string
          genres: string[]
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          sample_tracks: Json | null
          social_links: Json | null
          status: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          verification_documents: Json | null
        }
        Insert: {
          admin_notes?: string | null
          application_type: string
          audius_handle?: string | null
          audius_user_id?: string | null
          bio: string
          created_at?: string | null
          display_name: string
          genres: string[]
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sample_tracks?: Json | null
          social_links?: Json | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          verification_documents?: Json | null
        }
        Update: {
          admin_notes?: string | null
          application_type?: string
          audius_handle?: string | null
          audius_user_id?: string | null
          bio?: string
          created_at?: string | null
          display_name?: string
          genres?: string[]
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sample_tracks?: Json | null
          social_links?: Json | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          verification_documents?: Json | null
        }
        Relationships: []
      }
      artist_earnings: {
        Row: {
          amount: number
          artist_id: string
          created_at: string
          currency: string
          id: string
          processed_at: string | null
          status: string
          tip_id: string
          transaction_hash: string | null
        }
        Insert: {
          amount: number
          artist_id: string
          created_at?: string
          currency: string
          id?: string
          processed_at?: string | null
          status?: string
          tip_id: string
          transaction_hash?: string | null
        }
        Update: {
          amount?: number
          artist_id?: string
          created_at?: string
          currency?: string
          id?: string
          processed_at?: string | null
          status?: string
          tip_id?: string
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_earnings_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "artist_tips"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_revenue: {
        Row: {
          amount: number
          artist_id: string
          currency: string
          id: string
          metadata: Json | null
          recorded_at: string | null
          revenue_type: string
          source_id: string | null
          status: string
          transaction_hash: string | null
        }
        Insert: {
          amount: number
          artist_id: string
          currency: string
          id?: string
          metadata?: Json | null
          recorded_at?: string | null
          revenue_type: string
          source_id?: string | null
          status?: string
          transaction_hash?: string | null
        }
        Update: {
          amount?: number
          artist_id?: string
          currency?: string
          id?: string
          metadata?: Json | null
          recorded_at?: string | null
          revenue_type?: string
          source_id?: string | null
          status?: string
          transaction_hash?: string | null
        }
        Relationships: []
      }
      artist_tips: {
        Row: {
          amount: number
          artist_earnings_id: string | null
          artist_id: string
          artist_name: string
          artist_wallet_address: string | null
          confirmed_at: string | null
          created_at: string
          currency: string
          gas_sponsored: boolean | null
          id: string
          message: string | null
          network: string | null
          status: string
          transaction_hash: string | null
          usd_value: number | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          artist_earnings_id?: string | null
          artist_id: string
          artist_name: string
          artist_wallet_address?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency: string
          gas_sponsored?: boolean | null
          id?: string
          message?: string | null
          network?: string | null
          status?: string
          transaction_hash?: string | null
          usd_value?: number | null
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          artist_earnings_id?: string | null
          artist_id?: string
          artist_name?: string
          artist_wallet_address?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          gas_sponsored?: boolean | null
          id?: string
          message?: string | null
          network?: string | null
          status?: string
          transaction_hash?: string | null
          usd_value?: number | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_tips_earnings_fkey"
            columns: ["artist_earnings_id"]
            isOneToOne: false
            referencedRelation: "artist_earnings"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_uploads: {
        Row: {
          album_id: string | null
          artist_id: string
          artwork_url: string | null
          audio_file_url: string
          bit_rate: number | null
          copyright_info: string | null
          created_at: string | null
          description: string | null
          download_count: number | null
          duration: number | null
          file_format: string | null
          file_size: number | null
          genre: string
          id: string
          is_explicit: boolean | null
          is_single: boolean | null
          license_type: string | null
          play_count: number | null
          published_at: string | null
          sample_rate: number | null
          status: string
          tags: string[] | null
          title: string
          track_number: number | null
          updated_at: string | null
          uploaded_at: string | null
        }
        Insert: {
          album_id?: string | null
          artist_id: string
          artwork_url?: string | null
          audio_file_url: string
          bit_rate?: number | null
          copyright_info?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          duration?: number | null
          file_format?: string | null
          file_size?: number | null
          genre: string
          id?: string
          is_explicit?: boolean | null
          is_single?: boolean | null
          license_type?: string | null
          play_count?: number | null
          published_at?: string | null
          sample_rate?: number | null
          status?: string
          tags?: string[] | null
          title: string
          track_number?: number | null
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Update: {
          album_id?: string | null
          artist_id?: string
          artwork_url?: string | null
          audio_file_url?: string
          bit_rate?: number | null
          copyright_info?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          duration?: number | null
          file_format?: string | null
          file_size?: number | null
          genre?: string
          id?: string
          is_explicit?: boolean | null
          is_single?: boolean | null
          license_type?: string | null
          play_count?: number | null
          published_at?: string | null
          sample_rate?: number | null
          status?: string
          tags?: string[] | null
          title?: string
          track_number?: number | null
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_uploads_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      audius_artist_claims: {
        Row: {
          audius_display_name: string | null
          audius_follower_count: number | null
          audius_handle: string
          audius_track_count: number | null
          audius_user_id: string
          claim_status: string
          created_at: string | null
          id: string
          last_sync_at: string | null
          sync_enabled: boolean | null
          updated_at: string | null
          user_id: string
          verification_data: Json | null
          verification_method: string
          verified_at: string | null
        }
        Insert: {
          audius_display_name?: string | null
          audius_follower_count?: number | null
          audius_handle: string
          audius_track_count?: number | null
          audius_user_id: string
          claim_status?: string
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          verification_data?: Json | null
          verification_method: string
          verified_at?: string | null
        }
        Update: {
          audius_display_name?: string | null
          audius_follower_count?: number | null
          audius_handle?: string
          audius_track_count?: number | null
          audius_user_id?: string
          claim_status?: string
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          verification_data?: Json | null
          verification_method?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      audius_tracks: {
        Row: {
          artist_id: string
          artist_name: string
          artwork_url: string | null
          cached_at: string | null
          duration: number | null
          id: string
          play_count: number | null
          stream_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          artist_name: string
          artwork_url?: string | null
          cached_at?: string | null
          duration?: number | null
          id: string
          play_count?: number | null
          stream_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          artist_name?: string
          artwork_url?: string | null
          cached_at?: string | null
          duration?: number | null
          id?: string
          play_count?: number | null
          stream_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          target_id: string
          target_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          target_id: string
          target_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          target_id?: string
          target_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_deployments: {
        Row: {
          block_number: number
          contract_address: string
          contract_name: string
          created_at: string
          deployed_at: string
          deployer_address: string
          gas_used: number
          id: string
          network: string
          transaction_hash: string
          updated_at: string
        }
        Insert: {
          block_number: number
          contract_address: string
          contract_name: string
          created_at?: string
          deployed_at?: string
          deployer_address: string
          gas_used: number
          id?: string
          network?: string
          transaction_hash: string
          updated_at?: string
        }
        Update: {
          block_number?: number
          contract_address?: string
          contract_name?: string
          created_at?: string
          deployed_at?: string
          deployer_address?: string
          gas_used?: number
          id?: string
          network?: string
          transaction_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_streams: {
        Row: {
          backup_stream_url: string | null
          chat_enabled: boolean | null
          created_at: string
          ended_at: string | null
          event_id: string
          id: string
          is_live: boolean | null
          max_viewers: number | null
          recording_enabled: boolean | null
          recording_url: string | null
          started_at: string | null
          stream_key: string | null
          stream_url: string | null
          viewer_count: number | null
        }
        Insert: {
          backup_stream_url?: string | null
          chat_enabled?: boolean | null
          created_at?: string
          ended_at?: string | null
          event_id: string
          id?: string
          is_live?: boolean | null
          max_viewers?: number | null
          recording_enabled?: boolean | null
          recording_url?: string | null
          started_at?: string | null
          stream_key?: string | null
          stream_url?: string | null
          viewer_count?: number | null
        }
        Update: {
          backup_stream_url?: string | null
          chat_enabled?: boolean | null
          created_at?: string
          ended_at?: string | null
          event_id?: string
          id?: string
          is_live?: boolean | null
          max_viewers?: number | null
          recording_enabled?: boolean | null
          recording_url?: string | null
          started_at?: string | null
          stream_key?: string | null
          stream_url?: string | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_streams_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tickets: {
        Row: {
          currency: string
          event_id: string
          id: string
          metadata: Json | null
          price: number
          purchase_hash: string | null
          purchased_at: string
          qr_code: string | null
          status: string
          ticket_number: string | null
          ticket_type: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          currency?: string
          event_id: string
          id?: string
          metadata?: Json | null
          price: number
          purchase_hash?: string | null
          purchased_at?: string
          qr_code?: string | null
          status?: string
          ticket_number?: string | null
          ticket_type?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          currency?: string
          event_id?: string
          id?: string
          metadata?: Json | null
          price?: number
          purchase_hash?: string | null
          purchased_at?: string
          qr_code?: string | null
          status?: string
          ticket_number?: string | null
          ticket_type?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tickets_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          age_restriction: string | null
          artist_id: string
          cover_image_url: string | null
          created_at: string
          current_attendance: number | null
          description: string | null
          door_time: string | null
          end_time: string | null
          event_date: string
          event_type: string
          genre: string | null
          id: string
          is_virtual: boolean | null
          max_capacity: number | null
          metadata: Json | null
          start_time: string | null
          status: string
          stream_url: string | null
          tags: string[] | null
          ticket_price: number | null
          title: string
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          age_restriction?: string | null
          artist_id: string
          cover_image_url?: string | null
          created_at?: string
          current_attendance?: number | null
          description?: string | null
          door_time?: string | null
          end_time?: string | null
          event_date: string
          event_type?: string
          genre?: string | null
          id?: string
          is_virtual?: boolean | null
          max_capacity?: number | null
          metadata?: Json | null
          start_time?: string | null
          status?: string
          stream_url?: string | null
          tags?: string[] | null
          ticket_price?: number | null
          title: string
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          age_restriction?: string | null
          artist_id?: string
          cover_image_url?: string | null
          created_at?: string
          current_attendance?: number | null
          description?: string | null
          door_time?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string
          genre?: string | null
          id?: string
          is_virtual?: boolean | null
          max_capacity?: number | null
          metadata?: Json | null
          start_time?: string | null
          status?: string
          stream_url?: string | null
          tags?: string[] | null
          ticket_price?: number | null
          title?: string
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_events_artist_id"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_events_venue"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "public_venue_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_events_venue"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "public_venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_events_venue"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_events_venue_id"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "public_venue_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_events_venue_id"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "public_venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_events_venue_id"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_items: {
        Row: {
          artist_id: string
          category: string
          created_at: string | null
          currency: string
          description: string | null
          id: string
          images: string[] | null
          inventory_count: number | null
          is_active: boolean | null
          metadata: Json | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          category: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          images?: string[] | null
          inventory_count?: number | null
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          category?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          images?: string[] | null
          inventory_count?: number | null
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      merch_orders: {
        Row: {
          buyer_id: string
          created_at: string | null
          currency: string
          delivered_at: string | null
          id: string
          merch_item_id: string
          payment_confirmed_at: string | null
          quantity: number
          shipped_at: string | null
          shipping_address: Json | null
          status: string
          total_price: number
          transaction_hash: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          currency: string
          delivered_at?: string | null
          id?: string
          merch_item_id: string
          payment_confirmed_at?: string | null
          quantity?: number
          shipped_at?: string | null
          shipping_address?: Json | null
          status?: string
          total_price: number
          transaction_hash?: string | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          currency?: string
          delivered_at?: string | null
          id?: string
          merch_item_id?: string
          payment_confirmed_at?: string | null
          quantity?: number
          shipped_at?: string | null
          shipping_address?: Json | null
          status?: string
          total_price?: number
          transaction_hash?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merch_orders_merch_item_id_fkey"
            columns: ["merch_item_id"]
            isOneToOne: false
            referencedRelation: "merch_items"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_collections: {
        Row: {
          artist_id: string
          contract_address: string | null
          created_at: string
          current_supply: number | null
          description: string | null
          id: string
          is_active: boolean | null
          max_supply: number | null
          name: string
          network: string
          royalty_percentage: number | null
          symbol: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          contract_address?: string | null
          created_at?: string
          current_supply?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_supply?: number | null
          name: string
          network?: string
          royalty_percentage?: number | null
          symbol: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          contract_address?: string | null
          created_at?: string
          current_supply?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_supply?: number | null
          name?: string
          network?: string
          royalty_percentage?: number | null
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      nft_listings: {
        Row: {
          buyer_address: string | null
          created_at: string
          created_by: string | null
          currency: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          price: number
          seller_address: string
          sold_at: string | null
          token_id: string
        }
        Insert: {
          buyer_address?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          price: number
          seller_address: string
          sold_at?: string | null
          token_id: string
        }
        Update: {
          buyer_address?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          price?: number
          seller_address?: string
          sold_at?: string | null
          token_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_listings_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "nft_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_royalties: {
        Row: {
          amount_earned: number | null
          created_at: string
          id: string
          last_payout_at: string | null
          percentage: number
          recipient_address: string
          token_id: string
        }
        Insert: {
          amount_earned?: number | null
          created_at?: string
          id?: string
          last_payout_at?: string | null
          percentage: number
          recipient_address: string
          token_id: string
        }
        Update: {
          amount_earned?: number | null
          created_at?: string
          id?: string
          last_payout_at?: string | null
          percentage?: number
          recipient_address?: string
          token_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_royalties_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "nft_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_tokens: {
        Row: {
          collection_id: string
          created_at: string
          creator_address: string
          description: string | null
          id: string
          image_url: string | null
          is_for_sale: boolean | null
          metadata_uri: string | null
          name: string
          owner_address: string
          price: number | null
          royalty_percentage: number | null
          token_id: string
          track_id: string | null
          updated_at: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          creator_address: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_for_sale?: boolean | null
          metadata_uri?: string | null
          name: string
          owner_address: string
          price?: number | null
          royalty_percentage?: number | null
          token_id: string
          track_id?: string | null
          updated_at?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          creator_address?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_for_sale?: boolean | null
          metadata_uri?: string | null
          name?: string
          owner_address?: string
          price?: number | null
          royalty_percentage?: number | null
          token_id?: string
          track_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_tokens_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "nft_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      paymaster_logs: {
        Row: {
          contract_address: string
          created_at: string
          function_name: string
          gas_estimate: number
          id: string
          sponsored: boolean
          transaction_hash: string | null
          user_address: string
        }
        Insert: {
          contract_address: string
          created_at?: string
          function_name: string
          gas_estimate: number
          id?: string
          sponsored?: boolean
          transaction_hash?: string | null
          user_address: string
        }
        Update: {
          contract_address?: string
          created_at?: string
          function_name?: string
          gas_estimate?: number
          id?: string
          sponsored?: boolean
          transaction_hash?: string | null
          user_address?: string
        }
        Relationships: []
      }
      playlist_collaborators: {
        Row: {
          added_by: string
          created_at: string
          id: string
          permission_level: string
          playlist_id: string
          user_id: string
        }
        Insert: {
          added_by: string
          created_at?: string
          id?: string
          permission_level?: string
          playlist_id: string
          user_id: string
        }
        Update: {
          added_by?: string
          created_at?: string
          id?: string
          permission_level?: string
          playlist_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_collaborators_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "user_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_tracks: {
        Row: {
          added_at: string | null
          id: string
          playlist_id: string
          position: number
          track_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          playlist_id: string
          position: number
          track_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          playlist_id?: string
          position?: number
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "user_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "audius_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          artist_bio: string | null
          artist_location: string | null
          artist_registration_type: string | null
          artist_verified: boolean | null
          audius_handle: string | null
          audius_user_id: string | null
          audius_verified: boolean | null
          avatar_url: string | null
          base_wallet_address: string | null
          bio: string | null
          created_at: string | null
          genres: string[] | null
          id: string
          preferred_tip_currency: string | null
          social_links: Json | null
          tip_enabled: boolean | null
          updated_at: string | null
          username: string | null
          verification_status: string | null
          verified_at: string | null
          wallet_address: string | null
          website_url: string | null
        }
        Insert: {
          artist_bio?: string | null
          artist_location?: string | null
          artist_registration_type?: string | null
          artist_verified?: boolean | null
          audius_handle?: string | null
          audius_user_id?: string | null
          audius_verified?: boolean | null
          avatar_url?: string | null
          base_wallet_address?: string | null
          bio?: string | null
          created_at?: string | null
          genres?: string[] | null
          id: string
          preferred_tip_currency?: string | null
          social_links?: Json | null
          tip_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
          verification_status?: string | null
          verified_at?: string | null
          wallet_address?: string | null
          website_url?: string | null
        }
        Update: {
          artist_bio?: string | null
          artist_location?: string | null
          artist_registration_type?: string | null
          artist_verified?: boolean | null
          audius_handle?: string | null
          audius_user_id?: string | null
          audius_verified?: boolean | null
          avatar_url?: string | null
          base_wallet_address?: string | null
          bio?: string | null
          created_at?: string | null
          genres?: string[] | null
          id?: string
          preferred_tip_currency?: string | null
          social_links?: Json | null
          tip_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
          verification_status?: string | null
          verified_at?: string | null
          wallet_address?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      track_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          track_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          track_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "audius_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_listening_stats: {
        Row: {
          created_at: string
          id: string
          last_played_at: string
          play_count: number
          total_listen_time: number
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_played_at?: string
          play_count?: number
          total_listen_time?: number
          track_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_played_at?: string
          play_count?: number
          total_listen_time?: number
          track_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_playlists: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_collaborative: boolean | null
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_collaborative?: boolean | null
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_collaborative?: boolean | null
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          capacity: number | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      wallet_bindings: {
        Row: {
          created_at: string
          id: string
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          wallet_address?: string
          wallet_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_event_streams: {
        Row: {
          chat_enabled: boolean | null
          ended_at: string | null
          event_id: string | null
          id: string | null
          is_live: boolean | null
          recording_url: string | null
          started_at: string | null
          stream_url: string | null
          viewer_count: number | null
        }
        Insert: {
          chat_enabled?: boolean | null
          ended_at?: string | null
          event_id?: string | null
          id?: string | null
          is_live?: boolean | null
          recording_url?: string | null
          started_at?: string | null
          stream_url?: string | null
          viewer_count?: number | null
        }
        Update: {
          chat_enabled?: boolean | null
          ended_at?: string | null
          event_id?: string | null
          id?: string | null
          is_live?: boolean | null
          recording_url?: string | null
          started_at?: string | null
          stream_url?: string | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_streams_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      public_venue_info: {
        Row: {
          address: string | null
          capacity: number | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      public_venues: {
        Row: {
          address: string | null
          capacity: number | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_public_profile_columns: { Args: never; Returns: string }
      get_public_profile_data: {
        Args: { _profile_id: string }
        Returns: {
          artist_bio: string
          artist_location: string
          artist_verified: boolean
          audius_handle: string
          avatar_url: string
          bio: string
          created_at: string
          genres: string[]
          id: string
          social_links: Json
          username: string
          website_url: string
        }[]
      }
      get_public_tip_aggregates: {
        Args: never
        Returns: {
          avg_tip_range: string
          currency: string
          last_tip_date: string
          total_amount_range: string
          total_tips_count: number
        }[]
      }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      user_has_events_at_venue: {
        Args: { _user_id: string; _venue_id: string }
        Returns: boolean
      }
      user_owns_audius_track: {
        Args: { _track_artist_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "fan" | "artist" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["fan", "artist", "admin"],
    },
  },
} as const
