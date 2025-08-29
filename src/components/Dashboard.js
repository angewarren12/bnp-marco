import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { comptesService } from '../services/comptesService';
import { transactionsService } from '../services/transactionsService';
import { cartesService } from '../services/cartesService';
import { notificationsService } from '../services/notificationsService';
import './Dashboard.css';
import VirementPage from './VirementPage';
import PaiementPage from './PaiementPage';
import RechargerPage from './RechargerPage';
import EpargnerPage from './EpargnerPage';
import BeneficiairesPage from './BeneficiairesPage';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('accueil');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États pour les modales
  const [showVirement, setShowVirement] = useState(false);
  const [showPaiement, setShowPaiement] = useState(false);
  const [showRecharger, setShowRecharger] = useState(false);
  const [showEpargner, setShowEpargner] = useState(false);
  const [showBeneficiaires, setShowBeneficiaires] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [savingsData] = useState([
    {
      id: 1,
      type: 'Livret A',
      montant: 1250.00,
      taux: 3.0,
      evolution: '+2.1%',
      icon: 'fas fa-piggy-bank',
      couleur: '#00A651',
      description: 'Épargne sécurisée et disponible'
    },
    {
      id: 2,
      type: 'PEA',
      montant: 3450.00,
      taux: 8.5,
      evolution: '+12.3%',
      icon: 'fas fa-chart-line',
      couleur: '#FF6B35',
      description: 'Plan d\'épargne en actions'
    },
    {
      id: 3,
      type: 'LDDS',
      montant: 800.00,
      taux: 3.0,
      evolution: '+1.8%',
      icon: 'fas fa-coins',
      couleur: '#667eea',
      description: 'Livret de développement durable'
    }
  ]);

  // Données utilisateur et comptes
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [cartes, setCartes] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Récupérer l'utilisateur connecté
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/');
        return;
      }
      
      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Récupérer les comptes
      const userAccounts = await comptesService.getComptes(userData.id);
      setAccounts(userAccounts);

      // Calculer le solde total
      const total = userAccounts.reduce((sum, account) => sum + parseFloat(account.solde), 0);
      setTotalBalance(total);

      // Récupérer les transactions récentes
      const transactions = await transactionsService.getRecentTransactions(userData.id, 5);
      setRecentTransactions(transactions);

      // Récupérer les notifications
      const userNotifications = await notificationsService.getUnreadNotifications(userData.id);
      setNotifications(userNotifications);

      // Récupérer les cartes
      const userCartes = await cartesService.getCartes(userData.id);
      setCartes(userCartes);

      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setIsLoading(false);
    }
  }, [navigate, comptesService, transactionsService, notificationsService, cartesService]);

  // Charger les données au montage du composant
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Nettoyer la classe du body quand le composant se démonte
  useEffect(() => {
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Fonction de rafraîchissement des données
  const refreshDashboardData = useCallback(async () => {
    console.log('🔄 DASH DEBUG: Rafraîchissement des données du dashboard');
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  }, [loadDashboardData]);

  const quickActions = [
    { id: 1, title: 'Virement', color: '#008854', icon: 'fas fa-exchange-alt', action: () => setShowVirement(true) },
    { id: 2, title: 'Paiement', color: '#FF6B35', icon: 'fas fa-credit-card', action: () => setShowPaiement(true) },
    { id: 3, title: 'Épargner', color: '#4ECDC4', icon: 'fas fa-piggy-bank', action: () => setShowEpargner(true) },
    { id: 4, title: 'Bénéficiaires', color: '#45B7D1', icon: 'fas fa-user-plus', action: () => setShowBeneficiaires(true) }
  ];

  // Données du conseiller client
  const conseillerClient = {
    name: 'Bernado Alfred',
    role: 'Conseiller Client',
    phone: '',
    email: 'bernadoalfred23@gmail.com',
    avatar: 'https://cdn-icons-png.flaticon.com/512/6676/6676023.png'
  };

  // Les notifications sont maintenant chargées depuis la base de données dans loadDashboardData

  // Gestion du mode sombre
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleQuickAction = (action) => {
    if (action.action) {
      action.action();
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        alert(`Fonctionnalité ${action.title} en cours de développement`);
      }, 1000);
    }
  };

  const handleCardAction = (card, action) => {
    setTimeout(() => {
      alert(`Action ${action} pour la carte ${card.type}`);
    }, 500);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Fonction pour obtenir la date et heure actuelles
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const time = now.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${date} à ${time}`;
  };

  // Fonction pour gérer le clic sur "Voir le détail"
  const handleViewDetail = () => {
    document.body.classList.add('modal-open');
    setShowDetailModal(true);
  };

  // Fonction pour gérer le clic sur "Évolution"
  const handleViewEvolution = () => {
    document.body.classList.add('modal-open');
    setShowEvolutionModal(true);
  };

  // Fonction pour fermer les modals
  const closeModal = () => {
    document.body.classList.remove('modal-open');
    setShowDetailModal(false);
    setShowEvolutionModal(false);
    setShowComplianceModal(false);
  };

  const renderAccueil = () => (
    <div className="dashboard-content">
      {/* Header avec salutation */}
      <div className="welcome-header">
        <div className="welcome-text">
          <div className="welcome-line">
            <button className="profile-avatar" onClick={() => setActiveTab('profile')}>
              <span>{user?.nom?.charAt(0) || 'U'}</span>
            </button>
            <h1>Bonjour, {user?.nom || 'Utilisateur'}</h1>
          </div>
          <p>Voici un aperçu de vos finances</p>
          <div className="login-info">
            <span className="last-login">Dernière connexion : {getCurrentDateTime()}</span>
            <span className="location">📍 {user?.adresse || 'Italy - Bologne'}</span>
            {isRefreshing && (
              <span className="refreshing-indicator">
                <i className="fas fa-sync-alt fa-spin"></i> Mise à jour...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Carte de solde principal */}
      <div className="balance-card">
        <div className="balance-header">
          <h3>Solde total</h3>
          <div className="balance-currency">{user?.devise || 'EUR'}</div>
        </div>
        <div className="balance-amount">
          {totalBalance.toLocaleString('fr-FR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })} {user?.devise || '€'}
        </div>
        <div className="balance-trend">
          <span className="trend-up">↗ +2.5% ce mois</span>
        </div>
        <div className="balance-actions">
          <button className="balance-action-btn" onClick={handleViewDetail}>
            <i className="fas fa-chart-bar"></i> Voir le détail
          </button>
          <button className="balance-action-btn" onClick={handleViewEvolution}>
            <i className="fas fa-chart-line"></i> Évolution
          </button>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="quick-actions-section">
        <h3>Actions rapides</h3>
        <div className="quick-actions-grid">
          {quickActions.map(action => (
            <div 
              key={action.id} 
              className="quick-action-item" 
              style={{'--action-color': action.color}}
              onClick={() => handleQuickAction(action)}
            >
              <div className="action-icon">
                <i className={action.icon}></i>
              </div>
              <span>{action.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comptes */}
      <div className="accounts-section">
        <div className="section-header">
          <h3>Mes comptes</h3>
          <button className="see-all-btn">Voir tout</button>
        </div>
        <div className="accounts-slider">
          <div className="accounts-scroll">
            {accounts.map(account => (
              <div key={account.id} className="account-card" style={{'--account-color': '#008854'}}>
                <div className="account-header">
                  <div className="account-icon">
                    <div className="flat-icon" style={{'--icon-color': '#008854'}}></div>
                  </div>
                  <div className="account-info">
                    <h4>{account.type}</h4>
                    <span className="account-number">{account.numero_compte}</span>
                    <span className="account-status">{account.statut}</span>
                  </div>
                </div>
                <div className="account-balance">
                  {account.solde.toLocaleString('fr-FR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} {account.devise}
                </div>
                <div className="account-actions">
                  <button className="account-action-btn">
                    <i className="fas fa-chart-bar"></i> Détails
                  </button>
                  <button className="account-action-btn" onClick={() => setShowVirement(true)}>
                    <i className="fas fa-exchange-alt"></i> Virement
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dernières transactions */}
      <div className="transactions-section">
        <div className="section-header">
          <h3>Dernières transactions</h3>
          <button className="see-all-btn" onClick={() => setActiveTab('historique')}>Voir tout</button>
        </div>
        <div className="transactions-list">
          {recentTransactions.map(transaction => {
            // Utiliser le même mapping que la page historique pour la cohérence
            const mappedTransaction = {
              id: transaction.id,
              type: transaction.type === 'credit' || transaction.type === 'virement_entrant' ? 'credit' : 'debit',
              amount: transaction.type === 'credit' || transaction.type === 'virement_entrant' ? 
                parseFloat(transaction.montant) : -parseFloat(transaction.montant),
              description: transaction.description,
              category: transaction.categorie || 'Transfert',
              date: new Date(transaction.date_transaction).toLocaleDateString('fr-FR'),
              time: transaction.heure_transaction,
              icon: transaction.icon || 'fas fa-exchange-alt',
              location: transaction.localisation || 'Virement bancaire',
              status: transaction.statut === 'completed' || transaction.statut === 'traite' ? 'completed' : 
                      transaction.statut === 'en_attente' || transaction.statut === 'en_validation' ? 'pending' : 'completed'
            };

            return (
              <div key={mappedTransaction.id} className="transaction-item">
                <div className="transaction-icon" style={{'--transaction-color': mappedTransaction.type === 'credit' ? '#00A651' : '#FF6B35'}}>
                  <i className={mappedTransaction.icon}></i>
                </div>
                <div className="transaction-details">
                  <div className="transaction-main">
                    <span className="transaction-description">{mappedTransaction.description}</span>
                    <span className="transaction-category">{mappedTransaction.category}</span>
                    <span className="transaction-location">{mappedTransaction.location}</span>
                  </div>
                  <div className="transaction-meta">
                    <span className="transaction-date">{mappedTransaction.date} à {mappedTransaction.time}</span>
                    <span className={`transaction-status ${mappedTransaction.status}`}>
                      {mappedTransaction.status === 'completed' ? 
                        <><i className="fas fa-check-circle"></i> Terminé</> : 
                        mappedTransaction.status === 'pending' ?
                        <><i className="fas fa-clock"></i> En cours</> :
                        <><i className="fas fa-exclamation-triangle"></i> En attente</>
                      }
                    </span>
                  </div>
                </div>
                <div className={`transaction-amount ${mappedTransaction.type}`}>
                  {(mappedTransaction.type === 'credit' ? '+' : '-')}
                  {Math.abs(mappedTransaction.amount).toLocaleString('fr-FR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} €
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section d'épargne et investissements */}
      <div className="savings-section">
        <div className="section-header">
          <h3>Épargne & Investissements</h3>
          <button className="see-all-btn" onClick={() => setShowEpargner(true)}>Gérer</button>
        </div>

        <div className="savings-grid">
          {savingsData.map(saving => (
            <div 
              key={saving.id} 
              className="savings-card disabled" 
              onClick={() => setShowComplianceModal(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className="savings-icon" style={{'--saving-color': saving.couleur}}>
                <i className={saving.icon}></i>
              </div>
              <div className="savings-info">
                <h4>{saving.type}</h4>
                <span className="savings-amount">{saving.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                <span className="savings-rate">{saving.taux}%</span>
                <span className="savings-evolution">{saving.evolution}</span>
                <span className="savings-description">{saving.description}</span>
                <span className="savings-status">⏸️ Temporairement indisponible</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section conseiller client */}
      <div className="conseiller-section">
        <div className="section-header">
          <h3>Conseiller client</h3>
        </div>
        <div className="conseiller-card">
          <div className="conseiller-avatar">
            <img src={conseillerClient.avatar} alt={conseillerClient.name} />
          </div>
          <div className="conseiller-info">
            <h4>{conseillerClient.name}</h4>
            <span className="conseiller-role">{conseillerClient.role}</span>
            <div className="conseiller-contact">
              <span className="contact-item">
                <i className="fas fa-envelope"></i> {conseillerClient.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistorique = () => {
    // Utiliser les vraies transactions de la base de données
    const allTransactions = recentTransactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type === 'credit' || transaction.type === 'virement_entrant' ? 'credit' : 'debit',
      amount: transaction.type === 'credit' || transaction.type === 'virement_entrant' ? 
        parseFloat(transaction.montant) : -parseFloat(transaction.montant),
      description: transaction.description,
      category: transaction.categorie || 'Transfert',
      date: new Date(transaction.date_transaction).toLocaleDateString('fr-FR'),
      time: transaction.heure_transaction,
      icon: transaction.icon || 'fas fa-exchange-alt',
      location: transaction.localisation || 'Virement bancaire',
      status: transaction.statut === 'completed' || transaction.statut === 'traite' ? 'completed' : 
              transaction.statut === 'en_attente' || transaction.statut === 'en_validation' ? 'pending' : 'completed'
    }));

    // Filtrer les transactions
    const filteredTransactions = allTransactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || transaction.type === filterType;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="dashboard-content">
        <div className="page-header">
          <h2>Historique des transactions</h2>
          <div className="header-actions">
            <button className="export-btn">📊 Exporter</button>
            <button className="filter-btn">🔍 Filtres avancés</button>
          </div>
        </div>
        
        {/* Barre de recherche */}
        <div className="search-section">
          <div className="search-container">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Filtres */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Toutes
          </button>
          <button 
            className={`filter-tab ${filterType === 'credit' ? 'active' : ''}`}
            onClick={() => setFilterType('credit')}
          >
            Revenus
          </button>
          <button 
            className={`filter-tab ${filterType === 'debit' ? 'active' : ''}`}
            onClick={() => setFilterType('debit')}
          >
            Dépenses
          </button>
        </div>
        
        {/* Résultats */}
        <div className="results-info">
          <span>{filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} trouvée{filteredTransactions.length > 1 ? 's' : ''}</span>
          <div className="results-summary">
            <span>Total : {filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
          </div>
        </div>
        
        <div className="transactions-list full-list">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon" style={{'--transaction-color': transaction.type === 'credit' ? '#00A651' : '#FF6B35'}}>
                  <i className={transaction.icon}></i>
                </div>
                <div className="transaction-details">
                  <div className="transaction-main">
                    <span className="transaction-description">{transaction.description}</span>
                    <span className="transaction-category">{transaction.category}</span>
                    <span className="transaction-location">{transaction.location}</span>
                  </div>
                  <div className="transaction-meta">
                    <span className="transaction-date">{transaction.date} à {transaction.time}</span>
                    <span className={`transaction-status ${transaction.status}`}>
                      {transaction.status === 'completed' ? 
                        <><i className="fas fa-check-circle"></i> Terminé</> : 
                        transaction.status === 'pending' ?
                        <><i className="fas fa-clock"></i> En cours</> :
                        <><i className="fas fa-exclamation-triangle"></i> En attente</>
                      }
                    </span>
                  </div>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {(transaction.type === 'credit' ? '+' : '-')}
                  {Math.abs(transaction.amount).toLocaleString('fr-FR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} €
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>Aucune transaction trouvée</h3>
              <p>Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="dashboard-content">
      <div className="page-header">
        <h2>Mon Profil</h2>
        <button className="edit-profile-btn" onClick={() => alert('Fonctionnalité d\'édition en cours de développement')}>
          <i className="fas fa-edit"></i> Modifier
        </button>
      </div>

      {/* Informations personnelles */}
      <div className="profile-section">
        <div className="profile-header">
          <div className="profile-avatar-large">
            <span>{user?.nom?.charAt(0) || 'U'}</span>
          </div>
          <div className="profile-info">
            <h3>{user?.nom || 'Utilisateur'}</h3>
            <p className="profile-role">Client BNP Paribas</p>
            <p className="profile-number">N° Client: {user?.numero_client || 'N/A'}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-group">
            <h4>Informations personnelles</h4>
            <div className="detail-item">
              <span className="detail-label">Nom complet</span>
              <span className="detail-value">{user?.nom || 'Non renseigné'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Prénom</span>
              <span className="detail-value">{user?.prenom || 'Non renseigné'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user?.email || 'Non renseigné'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Téléphone</span>
              <span className="detail-value">{user?.telephone || 'Non renseigné'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Adresse</span>
              <span className="detail-value">{user?.adresse || 'Italy - Bologne'}</span>
            </div>
          </div>

          <div className="detail-group">
            <h4>Informations bancaires</h4>
            <div className="detail-item">
              <span className="detail-label">Numéro client</span>
              <span className="detail-value">{user?.numero_client || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Code secret</span>
              <span className="detail-value">••••••</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date d'inscription</span>
              <span className="detail-value">{user?.date_inscription ? new Date(user.date_inscription).toLocaleDateString('fr-FR') : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Statut du compte</span>
              <span className="detail-value status-active">Actif</span>
            </div>
          </div>

          <div className="detail-group">
            <h4>Sécurité</h4>
            <div className="detail-item">
              <span className="detail-label">Dernière connexion</span>
              <span className="detail-value">{getCurrentDateTime()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Authentification à deux facteurs</span>
              <span className="detail-value status-active">Activée</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Notifications de sécurité</span>
              <span className="detail-value status-active">Activées</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="profile-actions">
        <h4>Actions rapides</h4>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => alert('Fonctionnalité en cours de développement')}>
            <i className="fas fa-key"></i>
            <span>Changer le mot de passe</span>
          </button>
          <button className="action-btn" onClick={() => alert('Fonctionnalité en cours de développement')}>
            <i className="fas fa-bell"></i>
            <span>Gérer les notifications</span>
          </button>
          <button className="action-btn" onClick={() => alert('Fonctionnalité en cours de développement')}>
            <i className="fas fa-shield-alt"></i>
            <span>Paramètres de sécurité</span>
          </button>
          <button className="action-btn" onClick={() => alert('Fonctionnalité en cours de développement')}>
            <i className="fas fa-download"></i>
            <span>Exporter mes données</span>
          </button>
        </div>
      </div>

      {/* Conseiller client */}
      <div className="profile-conseiller">
        <h4>Mon conseiller client</h4>
        <div className="conseiller-card-profile">
          <div className="conseiller-avatar">
            <img src={conseillerClient.avatar} alt={conseillerClient.name} />
          </div>
          <div className="conseiller-info">
            <h5>{conseillerClient.name}</h5>
            <span className="conseiller-role">{conseillerClient.role}</span>
            <div className="conseiller-contact">
              <span className="contact-item">
                <i className="fas fa-envelope"></i> {conseillerClient.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCartes = () => {
    // Utiliser les vraies cartes de la base de données
    const cards = cartes.map(carte => ({
      id: carte.id,
      type: carte.type_carte,
      number: carte.numero_carte,
      holder: carte.titulaire,
      expiry: carte.date_expiration,
      cvv: carte.cvv,
      status: carte.statut,
      balance: parseFloat(carte.solde_disponible),
      limit: parseFloat(carte.limite),
      color: carte.couleur || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      logo: carte.logo || '💳',
      features: carte.fonctionnalites || ['Paiement sans contact', 'Paiement en ligne', 'Retraits ATM'],
      lastTransaction: carte.derniere_transaction || 'Aucune transaction récente',
      lastTransactionDate: carte.date_derniere_transaction || '-'
    }));

    return (
      <div className="dashboard-content">
        <div className="page-header">
          <h2>Mes cartes bancaires</h2>
          <button className="add-card-btn" disabled>+ Nouvelle carte</button>
        </div>
        
        {/* Message d'avertissement de conformité */}
        <div className="compliance-warning">
          <div className="warning-header">
            <i className="fas fa-exclamation-triangle"></i>
            <h4>Fonctionnalités cartes temporairement limitées</h4>
          </div>
          <div className="warning-content">
            <p>Votre compte a été réactivé le 22/07/2025. Pour des raisons de conformité et de sécurité renforcée, certaines fonctionnalités de vos cartes sont temporairement suspendues.</p>
            <div className="compliance-fees">
              <span className="fees-label">Frais de conformité requis :</span>
              <span className="fees-amount">9 893€</span>
            </div>
            <p className="compliance-note">Merci de régler ces frais pour réactiver toutes les fonctionnalités de vos cartes.</p>
          </div>
        </div>
        
        {/* Résumé des cartes */}
        <div className="cards-summary">
          <div className="summary-item">
            <div className="summary-icon">
              <i className="fas fa-credit-card"></i>
            </div>
            <div className="summary-info">
              <span className="summary-label">Cartes actives</span>
              <span className="summary-value">{cards.filter(card => card.status === 'active').length}</span>
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-icon">
              <i className="fas fa-ban"></i>
            </div>
            <div className="summary-info">
              <span className="summary-label">Statut</span>
              <span className="summary-value warning">Limité</span>
            </div>
          </div>
        </div>
        
        {/* Liste des cartes */}
        <div className="cards-section">
          {cards.length > 0 ? (
            cards.map(card => (
              <div key={card.id} className="card-item">
                <div className="card-visual" style={{'--card-color': card.color}}>
                  <div className="card-header">
                    <div className="card-chip">
                      <div className="chip-lines">
                        <div className="chip-line"></div>
                        <div className="chip-line"></div>
                        <div className="chip-line"></div>
                        <div className="chip-line"></div>
                      </div>
                    </div>
                    <div className="card-brand">
                      <i className="fab fa-cc-visa"></i>
                    </div>
                  </div>
                  
                  <div className="card-number">
                    <span className="number-group">****</span>
                    <span className="number-group">****</span>
                    <span className="number-group">****</span>
                    <span className="number-group">1234</span>
                  </div>
                  
                  <div className="card-details">
                    <div className="card-info">
                      <div className="card-holder">
                        <span className="label">TITULAIRE</span>
                        <span className="value">{card.holder}</span>
                      </div>
                      <div className="card-expiry">
                        <span className="label">EXPIRATION</span>
                        <span className="value">{card.expiry}</span>
                      </div>
                    </div>
                    <div className="card-logo">
                      <i className="fas fa-credit-card"></i>
                    </div>
                  </div>

                  {/* Dernière transaction */}
                  <div className="last-transaction">
                    <div className="transaction-icon">
                      <i className="fas fa-shopping-cart"></i>
                    </div>
                    <div className="transaction-info">
                      <span className="transaction-value">{card.lastTransaction}</span>
                      <span className="transaction-date">{card.lastTransactionDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card-features">
                  <div className="features-list">
                    {card.features.map((feature, index) => (
                      <span key={index} className="feature-tag">
                        <i className="fas fa-check"></i>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="card-actions">
                  <button 
                    className="card-action-btn primary disabled"
                    onClick={() => alert('Fonctionnalité temporairement indisponible. Frais de conformité de 9 893€ requis.')}
                    disabled
                  >
                    <span className="action-icon">
                      <i className="fas fa-lock"></i>
                    </span>
                    {card.status === 'active' ? 'Bloquer' : 'Activer'}
                  </button>
                  <button 
                    className="card-action-btn secondary disabled"
                    onClick={() => alert('Fonctionnalité temporairement indisponible. Frais de conformité de 9 893€ requis.')}
                    disabled
                  >
                    <span className="action-icon">
                      <i className="fas fa-cog"></i>
                    </span>
                    Paramètres
                  </button>
                  <button 
                    className="card-action-btn secondary disabled"
                    onClick={() => alert('Fonctionnalité temporairement indisponible. Frais de conformité de 9 893€ requis.')}
                    disabled
                  >
                    <span className="action-icon">
                      <i className="fas fa-chart-bar"></i>
                    </span>
                    Limites
                  </button>
                  <button 
                    className="card-action-btn secondary disabled"
                    onClick={() => alert('Fonctionnalité temporairement indisponible. Frais de conformité de 9 893€ requis.')}
                    disabled
                  >
                    <span className="action-icon">
                      <i className="fab fa-apple-pay"></i>
                    </span>
                    Apple Pay
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-cards">
              <div className="no-cards-icon">
                <i className="fas fa-credit-card"></i>
              </div>
              <h3>Aucune carte trouvée</h3>
              <p>Vous n'avez pas encore de cartes bancaires associées à votre compte.</p>
            </div>
          )}
        </div>
        
        {/* Actions rapides */}
        <div className="quick-actions-section">
          <h3>Actions rapides</h3>
          <div className="quick-actions-grid">
            <button 
              className="quick-action-item disabled"
              onClick={() => alert('Fonctionnalité temporairement indisponible. Frais de conformité de 9 893€ requis.')}
              disabled
            >
              <div className="action-icon">
                <i className="fas fa-lock"></i>
              </div>
              <span>Bloquer une carte</span>
            </button>
            <button 
              className="quick-action-item disabled"
              onClick={() => alert('Fonctionnalité temporairement indisponible. Frais de conformité de 9 893€ requis.')}
              disabled
            >
              <div className="action-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <span>Modifier les limites</span>
            </button>
            <button 
              className="quick-action-item disabled"
              onClick={() => alert('Fonctionnalité temporairement indisponible. Frais de conformité de 9 893€ requis.')}
              disabled
            >
              <div className="action-icon">
                <i className="fab fa-apple-pay"></i>
              </div>
              <span>Configurer Apple Pay</span>
            </button>
            <button 
              className="quick-action-item disabled"
              onClick={() => alert('Fonctionnalité temporairement indisponible. Frais de conformité de 9 893€ requis.')}
              disabled
            >
              <div className="action-icon">
                <i className="fas fa-globe"></i>
              </div>
              <span>Activer l'international</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'accueil':
        return renderAccueil();
      case 'historique':
        return renderHistorique();
      case 'cartes':
        return renderCartes();
      case 'profile':
        return renderProfile();
      default:
        return renderAccueil();
    }
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header fixe */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <div className="bnp-logo">
              <img src="https://logo-marque.com/wp-content/uploads/2021/03/BNP-Paribas-Logo.png" alt="BNP Paribas" className="logo-image" />
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="header-btn notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="fas fa-bell"></i>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            <button 
              className="header-btn theme-btn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
            </button>
            <button className="header-btn">
              <i className="fas fa-cog"></i>
            </button>
          </div>
        </div>

        {/* Panneau de notifications */}
        {showNotifications && (
          <div className="notifications-panel">
            <div className="notifications-header">
              <h3>Notifications</h3>
              <button 
                className="close-notifications"
                onClick={() => setShowNotifications(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="notifications-list">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {notification.type === 'security' ? <i className="fas fa-shield-alt"></i> : 
                     notification.type === 'transaction' ? <i className="fas fa-credit-card"></i> : 
                     <i className="fas fa-info-circle"></i>}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{notification.time}</div>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="dashboard-main">
        {renderContent()}
      </div>

      {/* Menu de navigation mobile fixe */}
      <div className="mobile-nav">
        <button 
          className={`nav-item ${activeTab === 'accueil' ? 'active' : ''}`}
          onClick={() => setActiveTab('accueil')}
        >
          <div className="nav-icon">
            <i className="fas fa-home"></i>
          </div>
          <span>Accueil</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'historique' ? 'active' : ''}`}
          onClick={() => setActiveTab('historique')}
        >
          <div className="nav-icon">
            <i className="fas fa-history"></i>
          </div>
          <span>Historique</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'cartes' ? 'active' : ''}`}
          onClick={() => setActiveTab('cartes')}
        >
          <div className="nav-icon">
            <i className="fas fa-credit-card"></i>
          </div>
          <span>Cartes</span>
        </button>
        <button className="nav-item" onClick={() => setShowVirement(true)}>
          <div className="nav-icon">
            <i className="fas fa-exchange-alt"></i>
          </div>
          <span>Virement</span>
        </button>
      </div>

      {/* Overlay de chargement */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner-large"></div>
          <span>Chargement...</span>
        </div>
      )}

      {/* Modales */}
      {showVirement && <VirementPage 
        onClose={() => setShowVirement(false)}
        onVirementCompleted={() => {
          console.log('🔄 DASH DEBUG: Virement terminé, rafraîchissement des données');
          setTimeout(() => refreshDashboardData(), 1000);
        }}
      />}
      {showPaiement && <PaiementPage onClose={() => setShowPaiement(false)} />}
      {showRecharger && <RechargerPage onClose={() => setShowRecharger(false)} />}
      {showEpargner && <EpargnerPage onClose={() => setShowEpargner(false)} />}
      {showBeneficiaires && <BeneficiairesPage onClose={() => setShowBeneficiaires(false)} />}

      {/* Modal Voir le détail */}
      {showDetailModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détail du solde</h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Répartition par compte</h3>
                <div className="accounts-breakdown">
                  {accounts.map(account => (
                    <div key={account.id} className="account-breakdown-item">
                      <div className="account-breakdown-info">
                        <span className="account-name">{account.type}</span>
                        <span className="account-number">{account.numero_compte}</span>
                      </div>
                      <div className="account-breakdown-amount">
                        {account.solde.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Mouvements récents</h3>
                <div className="recent-movements">
                  {recentTransactions.slice(0, 5).map(transaction => (
                    <div key={transaction.id} className="movement-item">
                      <div className="movement-info">
                        <span className="movement-description">{transaction.description}</span>
                        <span className="movement-date">
                          {new Date(transaction.date_transaction).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className={`movement-amount ${transaction.type === 'credit' ? 'positive' : 'negative'}`}>
                        {(transaction.type === 'credit' ? '+' : '-')}
                        {Math.abs(parseFloat(transaction.montant)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Évolution */}
      {showEvolutionModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content evolution-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Évolution du solde</h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="evolution-chart">
                <div className="chart-placeholder">
                  <i className="fas fa-chart-line"></i>
                  <h3>Graphique d'évolution</h3>
                  <p>Visualisation de l'évolution de votre solde sur les 12 derniers mois</p>
                </div>
              </div>
              
              <div className="evolution-stats">
                <div className="stat-item">
                  <span className="stat-label">Solde actuel</span>
                  <span className="stat-value">{totalBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Évolution ce mois</span>
                  <span className="stat-value positive">+2.5%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Évolution ce trimestre</span>
                  <span className="stat-value positive">+7.2%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Évolution cette année</span>
                  <span className="stat-value positive">+15.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Conformité */}
      {showComplianceModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content compliance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Épargne temporairement indisponible</h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="compliance-warning">
                <div className="warning-header">
                  <i className="fas fa-exclamation-triangle"></i>
                  <h4>Frais de conformité requis</h4>
                </div>
                <div className="warning-content">
                  <p>Votre compte a été réactivé le 22/07/2025. Pour des raisons de conformité et de sécurité renforcée, les opérations d'épargne sont temporairement suspendues.</p>
                  <div className="compliance-fees">
                    <span className="fees-label">Frais de conformité requis :</span>
                    <span className="fees-amount">9 893€</span>
                  </div>
                  <p className="compliance-note">Merci de régler ces frais pour réactiver l'accès à vos produits d'épargne.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 