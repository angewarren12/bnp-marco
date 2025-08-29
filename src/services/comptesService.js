import { supabase } from '../config/supabase'

// Structure de la table comptes
// CREATE TABLE comptes (
//   id SERIAL PRIMARY KEY,
//   type VARCHAR(100) NOT NULL,
//   numero VARCHAR(50) NOT NULL,
//   solde DECIMAL(10,2) NOT NULL DEFAULT 0,
//   devise VARCHAR(3) DEFAULT 'EUR',
//   couleur VARCHAR(7) DEFAULT '#008854',
//   iban VARCHAR(34) NOT NULL,
//   statut VARCHAR(50) DEFAULT 'active',
//   limite_credit DECIMAL(10,2),
//   user_id UUID REFERENCES auth.users(id),
//   date_creation TIMESTAMP DEFAULT NOW()
// );

export const comptesService = {
  // Récupérer tous les comptes
  async getComptes() {
    try {
      const { data, error } = await supabase
        .from('comptes')
        .select('*')
        .order('date_creation', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error)
      throw error
    }
  },

  // Récupérer un compte par ID
  async getCompteById(id) {
    try {
      const { data, error } = await supabase
        .from('comptes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération du compte:', error)
      throw error
    }
  },

  // Créer un nouveau compte
  async createCompte(compte) {
    try {
      const { data, error } = await supabase
        .from('comptes')
        .insert([{
          type: compte.type,
          numero: compte.numero,
          solde: compte.solde || 0,
          devise: compte.devise || 'EUR',
          couleur: compte.couleur || '#008854',
          iban: compte.iban,
          statut: compte.statut || 'active',
          limite_credit: compte.limite_credit || null
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error)
      throw error
    }
  },

  // Mettre à jour un compte
  async updateCompte(id, compte) {
    try {
      const { data, error } = await supabase
        .from('comptes')
        .update({
          type: compte.type,
          numero: compte.numero,
          solde: compte.solde,
          devise: compte.devise,
          couleur: compte.couleur,
          iban: compte.iban,
          statut: compte.statut,
          limite_credit: compte.limite_credit
        })
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compte:', error)
      throw error
    }
  },

  // Mettre à jour le solde d'un compte
  async updateSolde(id, nouveauSolde) {
    try {
      const { data, error } = await supabase
        .from('comptes')
        .update({ solde: nouveauSolde })
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erreur lors de la mise à jour du solde:', error)
      throw error
    }
  },

  // Supprimer un compte
  async deleteCompte(id) {
    try {
      const { error } = await supabase
        .from('comptes')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error)
      throw error
    }
  },

  // Obtenir le solde total de tous les comptes
  async getSoldeTotal() {
    try {
      const { data, error } = await supabase
        .from('comptes')
        .select('solde')
        .eq('statut', 'active')

      if (error) throw error
      
      const total = data.reduce((sum, compte) => sum + parseFloat(compte.solde), 0)
      return total
    } catch (error) {
      console.error('Erreur lors du calcul du solde total:', error)
      throw error
    }
  }
} 