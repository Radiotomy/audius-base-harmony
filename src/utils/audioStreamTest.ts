// Audio Stream Test Utility
// This utility tests the complete audio pipeline from Audius to playback

import { audiusService } from '@/services/audius';

export const testAudioStream = async (trackId: string) => {
  console.log('🧪 Testing audio stream for track:', trackId);
  
  try {
    // Step 1: Get stream URL
    console.log('📡 Getting stream URL...');
    const streamUrl = await audiusService.getStreamUrl(trackId);
    console.log('✅ Stream URL obtained:', streamUrl);
    
    if (!streamUrl) {
      throw new Error('No stream URL returned');
    }
    
    // Step 2: Test if URL is accessible
    console.log('🔍 Testing URL accessibility...');
    const response = await fetch(streamUrl, { method: 'HEAD' });
    console.log('📊 URL response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Stream URL returned ${response.status}: ${response.statusText}`);
    }
    
    // Step 3: Test audio loading
    console.log('🎵 Testing audio element loading...');
    const audio = new Audio();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        audio.remove();
        reject(new Error('Audio loading timeout (10s)'));
      }, 10000);
      
      audio.addEventListener('canplay', () => {
        clearTimeout(timeout);
        console.log('✅ Audio can play! Duration:', audio.duration);
        audio.remove();
        resolve({
          success: true,
          streamUrl,
          duration: audio.duration
        });
      });
      
      audio.addEventListener('error', (e) => {
        clearTimeout(timeout);
        console.error('❌ Audio loading error:', e);
        audio.remove();
        reject(new Error(`Audio loading failed: ${audio.error?.message || 'Unknown error'}`));
      });
      
      audio.src = streamUrl;
      audio.load();
    });
    
  } catch (error) {
    console.error('❌ Audio stream test failed:', error);
    throw error;
  }
};

// Test with the first trending track
export const testWithTrendingTrack = async () => {
  try {
    console.log('🎼 Getting trending tracks for testing...');
    const tracks = await audiusService.getTrendingTracks(1);
    
    if (tracks.length === 0) {
      throw new Error('No trending tracks available for testing');
    }
    
    const testTrack = tracks[0];
    console.log('🎯 Testing with track:', testTrack.title, 'by', testTrack.user.name);
    
    return await testAudioStream(testTrack.id);
  } catch (error) {
    console.error('❌ Trending track test failed:', error);
    throw error;
  }
};

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testAudioStream = testAudioStream;
  (window as any).testWithTrendingTrack = testWithTrendingTrack;
  console.log('🔧 Audio stream test functions available on window object');
}