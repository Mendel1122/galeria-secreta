import { supabase } from '../lib/supabase';
import type { Model, ModelService } from '../lib/supabase';

export class ModelServiceClass {
  static async getAllModels() {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getFeaturedModels() {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(6);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getModelById(id: string) {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getModelsByCategory(category: string) {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async searchModels(query: string) {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .or(`stage_name.ilike.%${query}%,location.ilike.%${query}%,specialties.cs.{${query}}`)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getModelServices(modelId: string) {
    try {
      const { data, error } = await supabase
        .from('model_services')
        .select(`
          *,
          service:services(*)
        `)
        .eq('model_id', modelId)
        .eq('is_available', true);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateModel(id: string, updates: Partial<Model>) {
    try {
      const { data, error } = await supabase
        .from('models')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async incrementBookingCount(modelId: string) {
    try {
      const { data, error } = await supabase
        .from('models')
        .update({ 
          total_bookings: supabase.raw('total_bookings + 1')
        })
        .eq('id', modelId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getModelStats(modelId: string) {
    try {
      // Get booking stats
      const { data: bookingStats, error: bookingError } = await supabase
        .from('bookings')
        .select('status')
        .eq('model_id', modelId);

      if (bookingError) throw bookingError;

      // Get review stats
      const { data: reviewStats, error: reviewError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('model_id', modelId)
        .eq('admin_approved', true);

      if (reviewError) throw reviewError;

      const stats = {
        total_bookings: bookingStats?.length || 0,
        completed_bookings: bookingStats?.filter(b => b.status === 'completed').length || 0,
        total_reviews: reviewStats?.length || 0,
        average_rating: reviewStats?.length 
          ? reviewStats.reduce((sum, r) => sum + r.rating, 0) / reviewStats.length 
          : 5.0
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async uploadModelPhoto(modelId: string, file: File, isMain: boolean = false) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${modelId}_${Date.now()}.${fileExt}`;
      const filePath = `models/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // Update model photos
      if (isMain) {
        const { error: updateError } = await supabase
          .from('models')
          .update({ main_photo_url: publicUrl })
          .eq('id', modelId);

        if (updateError) throw updateError;
      } else {
        // Add to gallery
        const { data: model, error: fetchError } = await supabase
          .from('models')
          .select('gallery_photos')
          .eq('id', modelId)
          .single();

        if (fetchError) throw fetchError;

        const updatedGallery = [...(model.gallery_photos || []), publicUrl];

        const { error: updateError } = await supabase
          .from('models')
          .update({ gallery_photos: updatedGallery })
          .eq('id', modelId);

        if (updateError) throw updateError;
      }

      return { data: publicUrl, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}