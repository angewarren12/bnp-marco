import { supabase } from '../config/supabase'

export const authService = {
  // Authentifier un utilisateur avec email et mot de passe (Supabase Auth)
  async authenticateWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (error) {
        throw new Error(error.message)
      }

      // Récupérer le profil utilisateur
      const profile = await this.getProfile(data.user.id)

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          nom: profile?.nom || '',
          prenom: profile?.prenom || '',
          numero_client: profile?.numero_client || '',
          localisation: profile?.localisation || '',
          derniere_connexion: profile?.derniere_connexion
        },
        session: data.session
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error)
      throw error
    }
  },

  // Authentifier un utilisateur avec numéro client et code secret (méthode bancaire)
  async authenticate(numeroClient, codeSecret) {
    try {
      // Rechercher le profil par numéro client
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('numero_client', numeroClient)
        .single()

      if (error) {
        throw new Error('Numéro client incorrect')
      }

      // Vérifier le code secret (en production, utiliser bcrypt)
      if (profile.code_secret !== codeSecret) {
        // Logger la tentative échouée
        await this.logConnexionAttempt(numeroClient, 'failed', 'Code secret incorrect')
        throw new Error('Code secret incorrect')
      }

      // Vérifier si le compte est actif
      if (profile.statut !== 'active') {
        throw new Error('Compte désactivé')
      }

      // Mettre à jour la dernière connexion
      await this.updateLastConnexion(profile.id)

      // Logger la connexion réussie
      await this.logConnexionAttempt(numeroClient, 'success', 'Connexion réussie')

      // Créer une session de connexion
      await this.createSession(profile.id)

      return {
        success: true,
        user: {
          id: profile.id,
          nom: profile.nom,
          prenom: profile.prenom,
          email: profile.email,
          numero_client: profile.numero_client,
          localisation: profile.localisation,
          derniere_connexion: profile.derniere_connexion
        }
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error)
      throw error
    }
  },

  // S'inscrire avec email et mot de passe
  async signUp(email, password, userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            nom: userData.nom,
            prenom: userData.prenom,
            numero_client: userData.numero_client
          }
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      // Créer le profil dans la table profiles
      if (data.user) {
        await this.createProfile(data.user.id, userData)
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      throw error
    }
  },

  // Créer un profil utilisateur
  async createProfile(userId, userData) {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          numero_client: userData.numero_client,
          code_secret: userData.code_secret || '12345',
          localisation: userData.localisation || 'Paris, France',
          statut: 'active'
        }])

      if (error) throw error
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error)
      throw error
    }
  },

  // Se déconnecter
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Marquer la session comme terminée
      const user = await this.getCurrentUser()
      if (user) {
        await this.logout(user.id)
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      throw error
    }
  },

  // Récupérer l'utilisateur actuel
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      return null
    }
  },

  // Récupérer la session actuelle
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error)
      return null
    }
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Mettre à jour la dernière connexion
  async updateLastConnexion(userId) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          derniere_connexion: new Date().toISOString(),
          localisation: 'Paris, France' // En production, détecter la localisation
        })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière connexion:', error)
    }
  },

  // Créer une session de connexion
  async createSession(userId) {
    try {
      const { error } = await supabase
        .from('sessions_connexion')
        .insert([{
          user_id: userId,
          ip_address: '127.0.0.1', // En production, récupérer l'IP réelle
          user_agent: navigator.userAgent,
          localisation: 'Paris, France',
          statut: 'active'
        }])

      if (error) throw error
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error)
    }
  },

  // Logger les tentatives de connexion
  async logConnexionAttempt(numeroClient, statut, raison) {
    try {
      const { error } = await supabase
        .from('tentatives_connexion')
        .insert([{
          numero_client: numeroClient,
          ip_address: '127.0.0.1', // En production, récupérer l'IP réelle
          user_agent: navigator.userAgent,
          statut: statut,
          raison: raison
        }])

      if (error) throw error
    } catch (error) {
      console.error('Erreur lors du logging de la tentative de connexion:', error)
    }
  },

  // Vérifier si un compte est verrouillé
  async checkAccountLocked(numeroClient) {
    try {
      // Compter les tentatives échouées des dernières 30 minutes
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('tentatives_connexion')
        .select('*')
        .eq('numero_client', numeroClient)
        .eq('statut', 'failed')
        .gte('date_tentative', thirtyMinutesAgo)

      if (error) throw error

      // Si plus de 3 tentatives échouées, le compte est verrouillé
      return data.length >= 3
    } catch (error) {
      console.error('Erreur lors de la vérification du verrouillage:', error)
      return false
    }
  },

  // Déverrouiller un compte
  async unlockAccount(numeroClient) {
    try {
      // Supprimer les tentatives échouées récentes
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      
      const { error } = await supabase
        .from('tentatives_connexion')
        .delete()
        .eq('numero_client', numeroClient)
        .eq('statut', 'failed')
        .gte('date_tentative', thirtyMinutesAgo)

      if (error) throw error
    } catch (error) {
      console.error('Erreur lors du déverrouillage du compte:', error)
    }
  },

  // Récupérer le profil d'un utilisateur
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      throw error
    }
  },

  // Test de connexion Supabase
  async testSupabaseConnection() {
    try {
      console.log('🔍 AUTH DEBUG: Test de connexion Supabase...');
      console.log('🔍 AUTH DEBUG: URL Supabase:', supabase.supabaseUrl);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      console.log('🔍 AUTH DEBUG: Test de connexion réussi');
      console.log('🔍 AUTH DEBUG: Données de test:', data);
      console.log('🔍 AUTH DEBUG: Erreur de test:', error);
      
      return { success: true, data, error };
    } catch (error) {
      console.error('❌ AUTH DEBUG: Erreur de connexion Supabase:', error);
      return { success: false, error };
    }
  },

  // Récupérer le profil par numéro client
  async getProfileByNumeroClient(numeroClient) {
    try {
      console.log('🔍 AUTH DEBUG: getProfileByNumeroClient appelé avec:', numeroClient);
      console.log('🔍 AUTH DEBUG: Type du numéro client:', typeof numeroClient);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('numero_client', numeroClient)
        .single()

      console.log('🔍 AUTH DEBUG: Requête Supabase exécutée');
      console.log('🔍 AUTH DEBUG: Données reçues:', data);
      console.log('🔍 AUTH DEBUG: Erreur reçue:', error);

      if (error) {
        console.log('❌ AUTH DEBUG: Erreur Supabase détectée:', error);
        throw error;
      }

      console.log('✅ AUTH DEBUG: Profil trouvé avec succès:', data);
      return data;
    } catch (error) {
      console.error('❌ AUTH DEBUG: Erreur lors de la récupération du profil par numéro client:', error);
      console.error('❌ AUTH DEBUG: Message d\'erreur:', error.message);
      console.error('❌ AUTH DEBUG: Code d\'erreur:', error.code);
      throw error;
    }
  },

  // Mettre à jour le profil
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      throw error
    }
  },

  // Déconnecter un utilisateur
  async logout(userId) {
    try {
      // Marquer la session comme terminée
      const { error } = await supabase
        .from('sessions_connexion')
        .update({ 
          statut: 'closed',
          date_deconnexion: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('statut', 'active')

      if (error) throw error
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  },

  // Réinitialiser le mot de passe
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error)
      throw error
    }
  },

  // Mettre à jour le mot de passe
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error)
      throw error
    }
  }
} 