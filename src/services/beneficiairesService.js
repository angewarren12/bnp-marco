import { supabase } from '../config/supabase'

// Structure de la table bénéficiaires
// CREATE TABLE beneficiaires (
//   id SERIAL PRIMARY KEY,
//   nom VARCHAR(255) NOT NULL,
//   prenom VARCHAR(255) NOT NULL,
//   email VARCHAR(255),
//   iban VARCHAR(34) NOT NULL,
//   bic VARCHAR(11) NOT NULL,
//   banque VARCHAR(255),
//   alias VARCHAR(255),
//   type VARCHAR(50) DEFAULT 'particulier',
//   date_creation TIMESTAMP DEFAULT NOW(),
//   user_id UUID REFERENCES auth.users(id)
// );

export const beneficiairesService = {
  // Récupérer tous les bénéficiaires
  async getBeneficiaires() {
    try {
      const { data, error } = await supabase
        .from('beneficiaires')
        .select('*')
        .order('date_creation', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la récupération des bénéficiaires:', error)
      throw error
    }
  },

  // Créer un nouveau bénéficiaire
  async createBeneficiaire(beneficiaire) {
    try {
      const { data, error } = await supabase
        .from('beneficiaires')
        .insert([{
          nom: beneficiaire.nom,
          prenom: beneficiaire.prenom,
          email: beneficiaire.email || null,
          iban: beneficiaire.iban,
          bic: beneficiaire.bic,
          banque: beneficiaire.banque || null,
          alias: beneficiaire.alias || null,
          type: beneficiaire.type || 'particulier'
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erreur lors de la création du bénéficiaire:', error)
      throw error
    }
  },

  // Supprimer un bénéficiaire
  async deleteBeneficiaire(id) {
    try {
      const { error } = await supabase
        .from('beneficiaires')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du bénéficiaire:', error)
      throw error
    }
  },

  // Mettre à jour un bénéficiaire
  async updateBeneficiaire(id, beneficiaire) {
    try {
      const { data, error } = await supabase
        .from('beneficiaires')
        .update({
          nom: beneficiaire.nom,
          prenom: beneficiaire.prenom,
          email: beneficiaire.email || null,
          iban: beneficiaire.iban,
          bic: beneficiaire.bic,
          banque: beneficiaire.banque || null,
          alias: beneficiaire.alias || null,
          type: beneficiaire.type || 'particulier'
        })
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bénéficiaire:', error)
      throw error
    }
  },

  // Rechercher des bénéficiaires
  async searchBeneficiaires(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('beneficiaires')
        .select('*')
        .or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,alias.ilike.%${searchTerm}%,iban.ilike.%${searchTerm}%`)
        .order('date_creation', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur lors de la recherche des bénéficiaires:', error)
      throw error
    }
  }
} 