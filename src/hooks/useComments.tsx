import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { commentSchema, validateAndSanitize, sanitizeHtml } from '@/lib/validation';

interface Comment {
  id: string;
  user_id: string;
  target_type: 'track' | 'playlist';
  target_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

interface UseCommentsProps {
  targetType: 'track' | 'playlist';
  targetId: string;
}

export const useComments = ({ targetType, targetId }: UseCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments for a target
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(comment => comment.user_id))];
        
        // Fetch profiles for comment users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Map profiles to comments
        const profileMap = new Map();
        profiles?.forEach(profile => {
          profileMap.set(profile.id, profile);
        });

        // Organize comments with replies and profiles
        const commentMap = new Map<string, Comment>();
        const topLevelComments: Comment[] = [];

        data.forEach(comment => {
          const formattedComment: Comment = {
            ...comment,
            target_type: comment.target_type as 'track' | 'playlist',
            user: profileMap.get(comment.user_id),
            replies: []
          };
          commentMap.set(comment.id, formattedComment);

          if (!comment.parent_id) {
            topLevelComments.push(formattedComment);
          }
        });

        // Add replies to their parent comments
        data.forEach(comment => {
          if (comment.parent_id && commentMap.has(comment.parent_id)) {
            const parentComment = commentMap.get(comment.parent_id)!;
            const childComment = commentMap.get(comment.id)!;
            parentComment.replies?.push(childComment);
          }
        });

        setComments(topLevelComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  // Add a new comment
  const addComment = useCallback(async (content: string, parentId?: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return false;
    }

    // Validate comment data
    const validation = validateAndSanitize(commentSchema, {
      content,
      target_type: targetType,
      target_id: targetId,
      parent_id: parentId,
    });

    if (!validation.success) {
      toast({
        title: "Invalid Comment",
        description: validation.errors.join(', '),
        variant: "destructive", 
      });
      return false;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          target_type: validation.data.target_type,
          target_id: validation.data.target_id,
          content: sanitizeHtml(validation.data.content),
          parent_id: validation.data.parent_id
        });

      if (error) throw error;

      await fetchComments();
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [user?.id, targetType, targetId, fetchComments]);

  // Update a comment
  const updateComment = useCallback(async (commentId: string, content: string) => {
    if (!user?.id) return false;

    if (!content.trim()) {
      toast({
        title: "Invalid Comment",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return false;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchComments();
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [user?.id, fetchComments]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user?.id) return false;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchComments();
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [user?.id, fetchComments]);

  // Initialize comments on mount
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    submitting,
    addComment,
    updateComment,
    deleteComment,
    fetchComments,
  };
};