import { supabase } from '../lib/supabase';
import type { Booking } from '../lib/supabase';
import { ModelServiceClass } from './modelService';
import { NotificationService } from './notificationService';

export class BookingService {
  static async createBooking(bookingData: Omit<Booking, 'id' | 'status' | 'payment_status' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          status: 'pending',
          payment_status: 'pending'
        })
        .select(`
          *,
          model:models(*),
          service:services(*),
          client:users(*)
        `)
        .single();

      if (error) throw error;

      // Increment model booking count
      await ModelServiceClass.incrementBookingCount(bookingData.model_id);

      // Create notifications
      await NotificationService.createNotification(
        bookingData.client_id,
        'Reserva Criada',
        'Sua reserva foi criada com sucesso e está aguardando confirmação.',
        'booking',
        { booking_id: data.id }
      );

      // Notify model (get model's user_id first)
      const { data: model } = await supabase
        .from('models')
        .select('user_id')
        .eq('id', bookingData.model_id)
        .single();

      if (model?.user_id) {
        await NotificationService.createNotification(
          model.user_id,
          'Nova Reserva',
          'Você recebeu uma nova solicitação de reserva.',
          'booking',
          { booking_id: data.id }
        );
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getUserBookings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          model:models(*),
          service:services(*),
          client:users(*)
        `)
        .eq('client_id', userId)
        .order('booking_date', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getModelBookings(modelId: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          model:models(*),
          service:services(*),
          client:users(*)
        `)
        .eq('model_id', modelId)
        .order('booking_date', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateBookingStatus(id: string, status: Booking['status'], userId: string) {
    try {
      const updateData: any = { status };
      
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_by = userId;
        updateData.cancelled_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          model:models(*),
          service:services(*),
          client:users(*)
        `)
        .single();

      if (error) throw error;

      // Create notifications based on status
      let title = '';
      let message = '';
      
      switch (status) {
        case 'confirmed':
          title = 'Reserva Confirmada';
          message = 'Sua reserva foi confirmada!';
          break;
        case 'completed':
          title = 'Reserva Concluída';
          message = 'Sua reserva foi concluída. Que tal deixar uma avaliação?';
          break;
        case 'cancelled':
          title = 'Reserva Cancelada';
          message = 'Sua reserva foi cancelada.';
          break;
      }

      if (title) {
        await NotificationService.createNotification(
          data.client_id,
          title,
          message,
          'booking',
          { booking_id: data.id }
        );
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getBookingById(id: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          model:models(*),
          service:services(*),
          client:users(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async cancelBooking(id: string, userId: string, reason?: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancelled_by: userId,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || null
        })
        .eq('id', id)
        .select(`
          *,
          model:models(*),
          service:services(*),
          client:users(*)
        `)
        .single();

      if (error) throw error;

      // Notify both parties
      await NotificationService.createNotification(
        data.client_id,
        'Reserva Cancelada',
        'Sua reserva foi cancelada.',
        'booking',
        { booking_id: data.id }
      );

      if (data.model?.user_id) {
        await NotificationService.createNotification(
          data.model.user_id,
          'Reserva Cancelada',
          'Uma reserva foi cancelada.',
          'booking',
          { booking_id: data.id }
        );
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getUpcomingBookings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          model:models(*),
          service:services(*)
        `)
        .or(`client_id.eq.${userId},model_id.in.(select id from models where user_id = '${userId}')`)
        .gte('booking_date', new Date().toISOString())
        .in('status', ['confirmed', 'pending'])
        .order('booking_date', { ascending: true })
        .limit(5);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updatePaymentStatus(bookingId: string, paymentStatus: Booking['payment_status']) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ payment_status: paymentStatus })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}