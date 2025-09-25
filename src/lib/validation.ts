import { z } from 'zod';

// Profile validation schemas
export const profileUpdateSchema = z.object({
  username: z.string()
    .trim()
    .min(2, 'Username must be at least 2 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  bio: z.string()
    .trim()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  website_url: z.string()
    .url('Must be a valid URL')
    .max(255, 'URL must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  
  artist_bio: z.string()
    .trim()
    .max(1000, 'Artist bio must be less than 1000 characters')
    .optional(),
  
  artist_location: z.string()
    .trim()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  
  genres: z.array(z.string().trim().min(1).max(50))
    .max(10, 'Maximum 10 genres allowed')
    .optional(),
});

// Artist application validation
export const artistApplicationSchema = z.object({
  display_name: z.string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must be less than 100 characters'),
  
  bio: z.string()
    .trim()
    .min(50, 'Bio must be at least 50 characters')
    .max(2000, 'Bio must be less than 2000 characters'),
  
  genres: z.array(z.string().trim().min(1).max(50))
    .min(1, 'At least one genre is required')
    .max(5, 'Maximum 5 genres allowed'),
  
  audius_handle: z.string()
    .trim()
    .min(2, 'Audius handle must be at least 2 characters')
    .max(50, 'Audius handle must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid Audius handle format')
    .optional(),
  
  social_links: z.object({
    twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
    instagram: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
    youtube: z.string().url('Invalid YouTube URL').optional().or(z.literal('')),
    soundcloud: z.string().url('Invalid SoundCloud URL').optional().or(z.literal('')),
  }).optional(),
});

// Comment validation
export const commentSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters'),
  
  target_type: z.union([z.literal('track'), z.literal('playlist'), z.literal('album')]),
  
  target_id: z.string()
    .trim()
    .min(1, 'Target ID is required'),
  
  parent_id: z.string().uuid('Invalid parent comment ID').optional(),
});

// Tip validation
export const tipSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount too large')
    .multipleOf(0.000001, 'Invalid amount precision'),
  
  currency: z.union([z.literal('ETH'), z.literal('USDC'), z.literal('DAI')]),
  
  message: z.string()
    .trim()
    .max(280, 'Message must be less than 280 characters')
    .optional(),
  
  artist_id: z.string()
    .trim()
    .min(1, 'Artist ID is required'),
  
  artist_name: z.string()
    .trim()
    .min(1, 'Artist name is required')
    .max(100, 'Artist name too long'),
});

// Track upload validation
export const trackUploadSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  genre: z.string()
    .trim()
    .min(1, 'Genre is required')
    .max(50, 'Genre must be less than 50 characters'),
  
  description: z.string()
    .trim()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  
  tags: z.array(z.string().trim().min(1).max(30))
    .max(20, 'Maximum 20 tags allowed')
    .optional(),
  
  license_type: z.union([
    z.literal('all_rights_reserved'), 
    z.literal('creative_commons'), 
    z.literal('public_domain')
  ]),
  
  is_explicit: z.boolean().default(false),
});

// Event validation
export const eventSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z.string()
    .trim()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  
  event_date: z.date()
    .refine(date => date > new Date(), {
      message: 'Event date must be in the future',
    }),
  
  ticket_price: z.number()
    .nonnegative('Ticket price cannot be negative')
    .max(10000, 'Ticket price too high')
    .optional(),
  
  max_capacity: z.number()
    .int('Capacity must be a whole number')
    .positive('Capacity must be positive')
    .max(1000000, 'Capacity too large')
    .optional(),
  
  genre: z.string()
    .trim()
    .max(50, 'Genre must be less than 50 characters')
    .optional(),
  
  age_restriction: z.union([
    z.literal('all_ages'), 
    z.literal('18+'), 
    z.literal('21+')
  ]).optional(),
});

// Wallet address validation
export const walletAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format');

// Sanitization helpers
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
      };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};