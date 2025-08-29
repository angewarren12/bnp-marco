import { supabase } from '../config/supabase'

export const notificationsService = {
  // Récupérer toutes les notifications d'un utilisateur
  async getNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('date_creation', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      throw error
    }
  },

  // Récupérer les notifications non lues
  async getUnreadNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('lu', false)
        .order('date_creation', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues:', error)
      throw error
    }
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ lu: true })
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
      throw error
    }
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ lu: true })
        .eq('user_id', userId)
        .eq('lu', false)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error)
      throw error
    }
  },

  // Créer une nouvelle notification
  async createNotification(userId, titre, message, type = 'info') {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          titre: titre,
          message: message,
          type: type,
          lu: false
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error)
      throw error
    }
  },

  // Supprimer une notification
  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error)
      throw error
    }
  },

  // Supprimer toutes les notifications lues
  async deleteReadNotifications(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('lu', true)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications lues:', error)
      throw error
    }
  },

  // Compter les notifications non lues
  async countUnreadNotifications(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('lu', false)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Erreur lors du comptage des notifications:', error)
      return 0
    }
  },

  // Créer une notification de transaction
  async createTransactionNotification(userId, titre, message, type = 'info') {
    try {
      console.log('🔍 NOTIF DEBUG: Création notification transaction:', { userId, titre, message, type });
      
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          titre: titre,
          message: message,
          type: type,
          user_id: userId,
          lu: false,
          date_creation: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ NOTIF DEBUG: Erreur création notification:', error);
        throw error;
      }

      console.log('✅ NOTIF DEBUG: Notification créée:', data);
      return data;
    } catch (error) {
      console.error('❌ NOTIF DEBUG: Erreur lors de la création de la notification:', error);
      throw error;
    }
  },

  async createSecurityNotification(userId, message) {
    const titre = 'Sécurité'
    return await this.createNotification(userId, titre, message, 'security')
  },

  async createInfoNotification(userId, titre, message) {
    return await this.createNotification(userId, titre, message, 'info')
  },

  async createWarningNotification(userId, titre, message) {
    return await this.createNotification(userId, titre, message, 'warning')
  }
} 