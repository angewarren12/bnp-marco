import { supabase } from '../config/supabase'

// Structure de la table transactions
// CREATE TABLE transactions (
//   id SERIAL PRIMARY KEY,
//   type VARCHAR(50) NOT NULL, -- 'credit' ou 'debit'
//   montant DECIMAL(10,2) NOT NULL,
//   description VARCHAR(255) NOT NULL,
//   categorie VARCHAR(100) NOT NULL,
//   date_transaction DATE NOT NULL,
//   heure_transaction TIME NOT NULL,
//   icone VARCHAR(100),
//   localisation VARCHAR(255),
//   statut VARCHAR(50) DEFAULT 'completed',
//   compte_id INTEGER,
//   user_id UUID REFERENCES auth.users(id),
//   date_creation TIMESTAMP DEFAULT NOW()
// );

export const transactionsService = {
  // Récupérer toutes les transactions
  async getTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date_transaction', { ascending: false })
        .order('heure_transaction', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error)
      throw error
    }
  },

  // Récupérer les transactions récentes (limitées)
  async getRecentTransactions(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date_transaction', { ascending: false })
        .order('heure_transaction', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions récentes:', error)
      throw error
    }
  },

  // Créer une nouvelle transaction
  async createTransaction(transactionData) {
    try {
      console.log('🔍 TRANS DEBUG: Création transaction:', transactionData);
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          type: transactionData.type,
          montant: transactionData.montant,
          description: transactionData.description,
          categorie: transactionData.categorie || 'Transfert',
          date_transaction: transactionData.date_transaction || new Date().toISOString(),
          heure_transaction: transactionData.heure_transaction || new Date().toTimeString().split(' ')[0],
          icone: transactionData.icone || 'fas fa-exchange-alt',
          localisation: transactionData.localisation || 'Virement bancaire',
          statut: transactionData.statut || 'completed',
          reference: transactionData.reference,
          compte_id: transactionData.compte_id,
          user_id: transactionData.user_id
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ TRANS DEBUG: Erreur création transaction:', error);
        throw error;
      }

      console.log('✅ TRANS DEBUG: Transaction créée:', data);
      return data;
    } catch (error) {
      console.error('❌ TRANS DEBUG: Erreur lors de la création de la transaction:', error);
      throw error;
    }
  },

  // Rechercher des transactions
  async searchTransactions(searchTerm, filterType = 'all') {
    try {
      let query = supabase
        .from('transactions')
        .select('*')

      // Appliquer le filtre de type
      if (filterType !== 'all') {
        query = query.eq('type', filterType)
      }

      // Appliquer la recherche
      if (searchTerm) {
        query = query.or(`description.ilike.%${searchTerm}%,categorie.ilike.%${searchTerm}%,localisation.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query
        .order('date_transaction', { ascending: false })
        .order('heure_transaction', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la recherche des transactions:', error)
      throw error
    }
  },

  // Supprimer une transaction
  async deleteTransaction(id) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de la transaction:', error)
      throw error
    }
  }
}; 