import React, { useState, useEffect } from 'react';
import { beneficiairesService } from '../services/beneficiairesService';
import './BeneficiairesPage.css';

const BeneficiairesPage = ({ onClose, onSelectBeneficiaire }) => {
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    iban: '',
    bic: '',
    banque: '',
    alias: '',
    email: ''
  });

  // Charger les bénéficiaires au montage
  useEffect(() => {
    const loadBeneficiaires = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          const data = await beneficiairesService.getBeneficiaires(userData.id);
          setBeneficiaires(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des bénéficiaires:', error);
        setError('Erreur lors du chargement des bénéficiaires');
      }
    };
    
    loadBeneficiaires();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setError('Le nom est obligatoire');
      return false;
    }
    if (!formData.prenom.trim()) {
      setError('Le prénom est obligatoire');
      return false;
    }
    if (!formData.iban.trim()) {
      setError('L\'IBAN est obligatoire');
      return false;
    }
    if (formData.iban.length < 20) {
      setError('L\'IBAN doit contenir au moins 20 caractères');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('L\'email n\'est pas valide');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const beneficiaireData = {
        ...formData,
        user_id: user.id
      };
      
      const newBeneficiaire = await beneficiairesService.createBeneficiaire(beneficiaireData);
      setBeneficiaires(prev => [newBeneficiaire, ...prev]);
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        prenom: '',
        iban: '',
        bic: '',
        banque: '',
        alias: '',
        email: ''
      });
      
      setShowForm(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la création du bénéficiaire:', error);
      setError(error.message || 'Erreur lors de la création du bénéficiaire');
      setIsLoading(false);
    }
  };

  const handleDelete = async (beneficiaireId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce bénéficiaire ?')) {
      return;
    }
    
    try {
      await beneficiairesService.deleteBeneficiaire(beneficiaireId);
      setBeneficiaires(prev => prev.filter(b => b.id !== beneficiaireId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression du bénéficiaire');
    }
  };

  const handleSelect = (beneficiaire) => {
    if (onSelectBeneficiaire) {
      onSelectBeneficiaire(beneficiaire);
    }
  };

  const filteredBeneficiaires = beneficiaires.filter(beneficiaire =>
    beneficiaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiaire.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiaire.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiaire.iban.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="beneficiaires-overlay">
      <div className="beneficiaires-modal">
        <div className="modal-header">
          <h1>Mes bénéficiaires</h1>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <div className="beneficiaires-actions">
            <div className="search-container">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher un bénéficiaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              <i className="fas fa-user-plus"></i>
              Nouveau bénéficiaire
            </button>
          </div>

          {showForm ? (
            <div className="beneficiaire-form">
              <h2>Nouveau bénéficiaire</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => handleInputChange('prenom', e.target.value)}
                      placeholder="Prénom"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nom *</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>IBAN *</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => handleInputChange('iban', e.target.value.toUpperCase())}
                    placeholder="FR76 3000 1000 1234 5678 9012 345"
                    maxLength="34"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>BIC/SWIFT</label>
                    <input
                      type="text"
                      value={formData.bic}
                      onChange={(e) => handleInputChange('bic', e.target.value.toUpperCase())}
                      placeholder="BNPAFRPP"
                      maxLength="11"
                    />
                  </div>
                  <div className="form-group">
                    <label>Banque</label>
                    <input
                      type="text"
                      value={formData.banque}
                      onChange={(e) => handleInputChange('banque', e.target.value)}
                      placeholder="Nom de la banque"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Alias (optionnel)</label>
                    <input
                      type="text"
                      value={formData.alias}
                      onChange={(e) => handleInputChange('alias', e.target.value)}
                      placeholder="Ex: Loyer, Factures..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@exemple.com"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Création...' : 'Créer le bénéficiaire'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="beneficiaires-list">
              {filteredBeneficiaires.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-users"></i>
                  <h3>Aucun bénéficiaire</h3>
                  <p>Vous n'avez pas encore de bénéficiaires enregistrés.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowForm(true)}
                  >
                    <i className="fas fa-user-plus"></i>
                    Ajouter votre premier bénéficiaire
                  </button>
                </div>
              ) : (
                filteredBeneficiaires.map(beneficiaire => (
                  <div key={beneficiaire.id} className="beneficiaire-card">
                    <div className="beneficiaire-avatar">
                      <span>{beneficiaire.prenom.charAt(0)}{beneficiaire.nom.charAt(0)}</span>
                    </div>
                    
                    <div className="beneficiaire-info">
                      <h3>{beneficiaire.prenom} {beneficiaire.nom}</h3>
                      {beneficiaire.alias && (
                        <span className="beneficiaire-alias">{beneficiaire.alias}</span>
                      )}
                      <span className="beneficiaire-iban">{beneficiaire.iban}</span>
                    </div>
                    
                    <div className="beneficiaire-actions">
                      {onSelectBeneficiaire && (
                        <button 
                          className="select-btn"
                          onClick={() => handleSelect(beneficiaire)}
                        >
                          <i className="fas fa-check"></i>
                          Sélectionner
                        </button>
                      )}
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(beneficiaire.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeneficiairesPage; 