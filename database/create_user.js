// Script pour créer un utilisateur dans Supabase Auth
// Exécutez ce script avec : node database/create_user.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ohnzpspnubvoxcuspiuf.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obnpwc3BudWJ2b3hjdXNwaXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDM4MTQsImV4cCI6MjA2OTQ3OTgxNH0.jIme6bXbhhLVV9nj617D9NxtQR_MVLXT4sXL-JOSyks'

// Utilisez la clé service role pour avoir les permissions admin
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUser() {
  try {
    console.log('🔄 Création de l\'utilisateur PAOLA MARIE MADELEINE dans Supabase Auth...')

    // Créer l'utilisateur avec email et mot de passe
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'paola.mariemadeleine@example.com',
      password: '52302',
      email_confirm: true, // Confirmer automatiquement l'email
      user_metadata: {
        nom: 'MARIE MADELEINE',
        prenom: 'PAOLA',
        numero_client: '3961515267'
      }
    })

    if (authError) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', authError)
      return
    }

    console.log('✅ Utilisateur créé avec succès!')
    console.log('📧 Email:', authData.user.email)
    console.log('🆔 UUID:', authData.user.id)
    console.log('📅 Date de création:', authData.user.created_at)

    // Créer le profil dans la table profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        nom: 'MARIE MADELEINE',
        prenom: 'PAOLA',
        email: 'paola.mariemadeleine@example.com',
        telephone: '01 42 34 56 78',
        numero_client: '3961515267',
        code_secret: '52302',
        localisation: 'Paris, France',
        statut: 'active'
      }])
      .select()

    if (profileError) {
      console.error('❌ Erreur lors de la création du profil:', profileError)
      return
    }

    console.log('✅ Profil créé avec succès!')
    console.log('👤 Nom complet:', `${profileData[0].prenom} ${profileData[0].nom}`)
    console.log('🏦 Numéro client:', profileData[0].numero_client)

    console.log('\n🎉 Utilisateur et profil créés avec succès!')
    console.log('🔐 Identifiants de connexion:')
    console.log('   📧 Email: paola.mariemadeleine@example.com')
    console.log('   🔑 Mot de passe: 52302')
    console.log('   🆔 UUID:', authData.user.id)

    return authData.user.id

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Alternative: Créer l'utilisateur via l'interface web
async function createUserViaWeb() {
  console.log('🌐 Pour créer l\'utilisateur via l\'interface web:')
  console.log('1. Allez sur https://ohnzpspnubvoxcuspiuf.supabase.co')
  console.log('2. Connectez-vous à votre compte Supabase')
  console.log('3. Allez dans Authentication > Users')
  console.log('4. Cliquez sur "Add user"')
  console.log('5. Remplissez les informations:')
  console.log('   - Email: paola.mariemadeleine@example.com')
  console.log('   - Password: 52302')
  console.log('   - User metadata:')
  console.log('     {')
  console.log('       "nom": "MARIE MADELEINE",')
  console.log('       "prenom": "PAOLA",')
  console.log('       "numero_client": "3961515267"')
  console.log('     }')
  console.log('6. Cliquez sur "Create user"')
  console.log('7. Copiez l\'UUID généré')
  console.log('8. Exécutez le script SQL avec cet UUID')
}

// Vérifier si l'utilisateur existe déjà
async function checkUserExists() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Erreur lors de la vérification:', error)
      return
    }

    const user = data.users.find(u => u.email === 'paola.mariemadeleine@example.com')
    
    if (user) {
      console.log('✅ Utilisateur trouvé!')
      console.log('🆔 UUID:', user.id)
      console.log('📧 Email:', user.email)
      console.log('📅 Créé le:', user.created_at)
      return user.id
    } else {
      console.log('❌ Utilisateur non trouvé')
      return null
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
    return null
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Script de création d\'utilisateur BNP Paribas')
  console.log('===============================================\n')
  console.log('👤 Création de l\'utilisateur: PAOLA MARIE MADELEINE')
  console.log('🏦 Numéro client: 3961515267')
  console.log('💰 Solde: 770.000€')
  console.log('📍 Localisation: Paris\n')

  // Vérifier si l'utilisateur existe déjà
  const existingUserId = await checkUserExists()
  
  if (existingUserId) {
    console.log('\n📝 L\'utilisateur existe déjà. Vous pouvez maintenant:')
    console.log('1. Exécuter le script SQL database/init_paola.sql')
    console.log('2. Ou utiliser l\'UUID existant:', existingUserId)
    return existingUserId
  }

  // Créer l'utilisateur
  const userId = await createUser()
  
  if (userId) {
    console.log('\n📝 Utilisateur créé. Vous pouvez maintenant:')
    console.log('1. Exécuter le script SQL database/init_paola.sql')
    console.log('2. Utiliser l\'UUID:', userId)
  } else {
    console.log('\n❌ Échec de la création. Utilisez la méthode web:')
    await createUserViaWeb()
  }
}

// Exécuter le script
main() 