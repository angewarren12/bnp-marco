import { supabase } from '../config/supabase';

export const cartesService = {
  // Récupérer toutes les cartes d'un utilisateur
  async getCartes(userId) {
    try {
      const { data, error } = await supabase
        .from('cartes')
        .select('*')
        .eq('user_id', userId)
        .order('date_creation', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des cartes:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getCartes:', error);
      throw error;
    }
  },

  // Récupérer une carte par ID
  async getCarteById(carteId) {
    try {
      const { data, error } = await supabase
        .from('cartes')
        .select('*')
        .eq('id', carteId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la carte:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans getCarteById:', error);
      throw error;
    }
  },

  // Créer une nouvelle carte
  async createCarte(carteData) {
    try {
      const { data, error } = await supabase
        .from('cartes')
        .insert([carteData])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la carte:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans createCarte:', error);
      throw error;
    }
  },

  // Mettre à jour une carte
  async updateCarte(carteId, updates) {
    try {
      const { data, error } = await supabase
        .from('cartes')
        .update(updates)
        .eq('id', carteId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de la carte:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans updateCarte:', error);
      throw error;
    }
  },

  // Supprimer une carte
  async deleteCarte(carteId) {
    try {
      const { error } = await supabase
        .from('cartes')
        .delete()
        .eq('id', carteId);

      if (error) {
        console.error('Erreur lors de la suppression de la carte:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur dans deleteCarte:', error);
      throw error;
    }
  },

  // Bloquer/Débloquer une carte
  async toggleCarteStatus(carteId, newStatus) {
    try {
      const { data, error } = await supabase
        .from('cartes')
        .update({ statut: newStatus })
        .eq('id', carteId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors du changement de statut de la carte:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur dans toggleCarteStatus:', error);
      throw error;
    }
  }
}; 