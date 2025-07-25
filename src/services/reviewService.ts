import { supabase } from '../lib/supabase';
import type { Review } from '../lib/supabase';

export class ReviewService {
  static async createReview(reviewData: Omit<Review, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select(`
          *,
          client:users(*),
          model:models(*)
        `)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getModelReviews(modelId: string) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          client:users(full_name)
        `)
        .eq('model_id', modelId)
        .eq('admin_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getUserReviews(userId: string) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          model:models(*),
          booking:bookings(*)
        `)
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async canUserReview(userId: string, bookingId: string) {
    try {
      // Check if booking exists and is completed
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('client_id', userId)
        .eq('status', 'completed')
        .single();

      if (bookingError) return { data: false, error: bookingError };

      // Check if review already exists
      const { data: existingReview, error: reviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('client_id', userId)
        .eq('booking_id', bookingId)
        .single();

      if (reviewError && reviewError.code !== 'PGRST116') {
        return { data: false, error: reviewError };
      }

      return { data: !existingReview, error: null };
    } catch (error) {
      return { data: false, error };
    }
  }

  static async updateReview(reviewId: string, updates: Partial<Pick<Review, 'rating' | 'comment' | 'pros' | 'cons'>>) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .select(`
          *,
          client:users(*),
          model:models(*)
        `)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async deleteReview(reviewId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('client_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async addModelResponse(reviewId: string, modelUserId: string, response: string) {
    try {
      // First verify the model owns this review
      const { data: review, error: fetchError } = await supabase
        .from('reviews')
        .select(`
          *,
          model:models(user_id)
        `)
        .eq('id', reviewId)
        .single();

      if (fetchError) throw fetchError;

      if (review.model?.user_id !== modelUserId) {
        throw new Error('Não autorizado a responder esta avaliação');
      }

      const { data, error } = await supabase
        .from('reviews')
        .update({
          response_from_model: response,
          response_date: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getFeaturedReviews(limit: number = 6) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          client:users(full_name),
          model:models(stage_name, main_photo_url)
        `)
        .eq('admin_approved', true)
        .eq('is_featured', true)
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}