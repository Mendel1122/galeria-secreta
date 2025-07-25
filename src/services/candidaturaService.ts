import { supabase } from '../lib/supabase';
import type { Candidatura } from '../lib/supabase';

export class CandidaturaService {
  static async submitCandidatura(candidaturaData: Omit<Candidatura, 'id' | 'status' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('candidaturas')
        .insert({
          ...candidaturaData,
          status: 'pendente'
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAllCandidaturas() {
    try {
      const { data, error } = await supabase
        .from('candidaturas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getCandidaturaById(id: string) {
    try {
      const { data, error } = await supabase
        .from('candidaturas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateCandidaturaStatus(
    id: string, 
    status: Candidatura['status'], 
    adminId: string,
    observacoes?: string,
    adminNotes?: string,
    interviewDate?: string
  ) {
    try {
      const updateData: any = {
        status,
        processed_by: adminId,
        processed_at: new Date().toISOString()
      };

      if (observacoes) updateData.observacoes = observacoes;
      if (adminNotes) updateData.admin_notes = adminNotes;
      if (interviewDate) updateData.interview_date = interviewDate;

      const { data, error } = await supabase
        .from('candidaturas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async uploadCandidaturaPhoto(file: File, candidaturaId: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${candidaturaId}_${Date.now()}.${fileExt}`;
      const filePath = `candidaturas/${fileName}`;

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

      return { data: publicUrl, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getCandidaturasByStatus(status: Candidatura['status']) {
    try {
      const { data, error } = await supabase
        .from('candidaturas')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async searchCandidaturas(query: string) {
    try {
      const { data, error } = await supabase
        .from('candidaturas')
        .select('*')
        .or(`nome.ilike.%${query}%,email.ilike.%${query}%,provincia.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getCandidaturaStats() {
    try {
      const { data: all, error: allError } = await supabase
        .from('candidaturas')
        .select('status');

      if (allError) throw allError;

      const stats = {
        total: all?.length || 0,
        pendente: all?.filter(c => c.status === 'pendente').length || 0,
        em_analise: all?.filter(c => c.status === 'em_analise').length || 0,
        aprovada: all?.filter(c => c.status === 'aprovada').length || 0,
        rejeitada: all?.filter(c => c.status === 'rejeitada').length || 0,
        entrevista_agendada: all?.filter(c => c.status === 'entrevista_agendada').length || 0
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async deleteCandidatura(id: string, adminId: string) {
    try {
      // First get the candidatura to delete associated photos
      const { data: candidatura, error: fetchError } = await supabase
        .from('candidaturas')
        .select('foto_url, fotos_adicionais')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete photos from storage
      const photosToDelete = [];
      if (candidatura.foto_url) {
        const fileName = candidatura.foto_url.split('/').pop();
        if (fileName) photosToDelete.push(`candidaturas/${fileName}`);
      }
      
      candidatura.fotos_adicionais?.forEach((url: string) => {
        const fileName = url.split('/').pop();
        if (fileName) photosToDelete.push(`candidaturas/${fileName}`);
      });

      if (photosToDelete.length > 0) {
        await supabase.storage
          .from('photos')
          .remove(photosToDelete);
      }

      // Delete candidatura record
      const { data, error } = await supabase
        .from('candidaturas')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}