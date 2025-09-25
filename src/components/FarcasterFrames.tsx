import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Share2, Heart, MessageCircle, Zap, Music } from 'lucide-react';
import { toast } from 'sonner';

interface FarcasterFrame {
  id: string;
  title: string;
  description: string;
  image: string;
  buttons: FrameButton[];
  url: string;
}

interface FrameButton {
  text: string;
  action: 'post' | 'link' | 'mint' | 'tip';
  target?: string;
}

interface FarcasterFramesProps {
  trackId?: string;
  artistId?: string;
  eventId?: string;
}

export const FarcasterFrames: React.FC<FarcasterFramesProps> = ({
  trackId,
  artistId,
  eventId
}) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMusicFrame = async () => {
    if (!trackId) {
      toast.error('No track selected');
      return;
    }

    setIsGenerating(true);
    try {
      const frame: FarcasterFrame = {
        id: `music-${trackId}`,
        title: 'Listen on AudioBASE',
        description: 'Discover amazing music on Base',
        image: `https://your-domain.com/api/frames/music/${trackId}/image`,
        buttons: [
          { text: '🎵 Listen', action: 'link', target: `https://your-app.com/track/${trackId}` },
          { text: '💝 Tip Artist', action: 'tip', target: artistId },
          { text: '🎨 Mint NFT', action: 'mint', target: trackId },
          { text: '❤️ Like', action: 'post' }
        ],
        url: `https://your-domain.com/api/frames/music/${trackId}`
      };

      const frameHtml = generateFrameHTML(frame);
      setShareUrl(`https://warpcast.com/~/compose?text=Check out this track on AudioBASE!&embeds[]=${encodeURIComponent(frame.url)}`);
      
      toast.success('Music frame generated! Copy the share URL below.');
    } catch (error) {
      toast.error('Failed to generate music frame');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTipFrame = async () => {
    if (!artistId) {
      toast.error('No artist selected');
      return;
    }

    setIsGenerating(true);
    try {
      const frame: FarcasterFrame = {
        id: `tip-${artistId}`,
        title: 'Tip Artist on AudioBASE',
        description: 'Support your favorite artist with ETH tips',
        image: `https://your-domain.com/api/frames/tip/${artistId}/image`,
        buttons: [
          { text: '⚡ Tip 0.001 ETH', action: 'post', target: '0.001' },
          { text: '💰 Tip 0.01 ETH', action: 'post', target: '0.01' },
          { text: '🚀 Tip 0.1 ETH', action: 'post', target: '0.1' },
          { text: '🎯 Custom Tip', action: 'link', target: `https://your-app.com/artist/${artistId}` }
        ],
        url: `https://your-domain.com/api/frames/tip/${artistId}`
      };

      const frameHtml = generateFrameHTML(frame);
      setShareUrl(`https://warpcast.com/~/compose?text=Support this amazing artist on AudioBASE!&embeds[]=${encodeURIComponent(frame.url)}`);
      
      toast.success('Tip frame generated! Share to help artists earn.');
    } catch (error) {
      toast.error('Failed to generate tip frame');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateEventFrame = async () => {
    if (!eventId) {
      toast.error('No event selected');
      return;
    }

    setIsGenerating(true);
    try {
      const frame: FarcasterFrame = {
        id: `event-${eventId}`,
        title: 'Join Event on AudioBASE',
        description: 'Get tickets for this exclusive music event',
        image: `https://your-domain.com/api/frames/event/${eventId}/image`,
        buttons: [
          { text: '🎫 Buy Ticket', action: 'link', target: `https://your-app.com/event/${eventId}` },
          { text: '📅 Add to Calendar', action: 'post' },
          { text: '🔄 Share Event', action: 'post' },
          { text: '💝 Tip Artist', action: 'tip', target: artistId }
        ],
        url: `https://your-domain.com/api/frames/event/${eventId}`
      };

      const frameHtml = generateFrameHTML(frame);
      setShareUrl(`https://warpcast.com/~/compose?text=Join me at this amazing event!&embeds[]=${encodeURIComponent(frame.url)}`);
      
      toast.success('Event frame generated! Help spread the word.');
    } catch (error) {
      toast.error('Failed to generate event frame');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFrameHTML = (frame: FarcasterFrame): string => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${frame.title}</title>
        
        <!-- Farcaster Frame Meta Tags -->
        <meta property="fc:frame" content="vNext">
        <meta property="fc:frame:title" content="${frame.title}">
        <meta property="fc:frame:image" content="${frame.image}">
        <meta property="fc:frame:image:aspect_ratio" content="1.91:1">
        
        ${frame.buttons.map((button, index) => `
        <meta property="fc:frame:button:${index + 1}" content="${button.text}">
        <meta property="fc:frame:button:${index + 1}:action" content="${button.action}">
        ${button.target ? `<meta property="fc:frame:button:${index + 1}:target" content="${button.target}">` : ''}
        `).join('')}
        
        <meta property="fc:frame:post_url" content="${frame.url}">
        
        <!-- Open Graph Meta Tags -->
        <meta property="og:title" content="${frame.title}">
        <meta property="og:description" content="${frame.description}">
        <meta property="og:image" content="${frame.image}">
        <meta property="og:url" content="${frame.url}">
        
        <!-- Twitter Meta Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${frame.title}">
        <meta name="twitter:description" content="${frame.description}">
        <meta name="twitter:image" content="${frame.image}">
      </head>
      <body>
        <h1>${frame.title}</h1>
        <p>${frame.description}</p>
        <img src="${frame.image}" alt="${frame.title}" style="width: 100%; max-width: 600px;">
      </body>
    </html>
    `;
  };

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share URL copied to clipboard!');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Farcaster Frames
          <Badge variant="secondary">Base Integration</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button 
            onClick={generateMusicFrame}
            disabled={!trackId || isGenerating}
            className="flex items-center gap-2"
          >
            <Music className="h-4 w-4" />
            Music Frame
          </Button>
          
          <Button 
            onClick={generateTipFrame}
            disabled={!artistId || isGenerating}
            className="flex items-center gap-2"
            variant="secondary"
          >
            <Zap className="h-4 w-4" />
            Tip Frame
          </Button>
          
          <Button 
            onClick={generateEventFrame}
            disabled={!eventId || isGenerating}
            className="flex items-center gap-2"
            variant="outline"
          >
            <MessageCircle className="h-4 w-4" />
            Event Frame
          </Button>
        </div>

        {shareUrl && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Share URL:</label>
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="font-mono text-xs"
              />
              <Button onClick={copyShareUrl} size="sm">
                Copy
              </Button>
            </div>
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Frame Features
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Interactive music previews with Base tips</li>
            <li>• One-click NFT minting from Farcaster</li>
            <li>• Gasless transactions via Coinbase Paymaster</li>
            <li>• Base Names integration for social identity</li>
            <li>• Event ticket purchases with Base wallets</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};