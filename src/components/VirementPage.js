import React, { useState, useEffect } from 'react';
import { virementsService } from '../services/virementsService';
import { comptesService } from '../services/comptesService';
import './VirementPage.css';
import BeneficiairesPage from './BeneficiairesPage';

const VirementPage = ({ onClose, onVirementCompleted }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    montant: '',
    beneficiaire: null,
    iban: '',
    motif: '',
    compteSource: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBeneficiaires, setShowBeneficiaires] = useState(false);
  const [comptes, setComptes] = useState([]);
  const [user, setUser] = useState(null);

  // Charger les données utilisateur et comptes
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Charger les comptes de l'utilisateur
          const userComptes = await comptesService.getComptes(userData.id);
          setComptes(userComptes);
          
          // Définir le compte principal par défaut
          if (userComptes.length > 0) {
            setFormData(prev => ({ ...prev, compteSource: userComptes[0] }));
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
      }
    };
    
    loadData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleBeneficiaireSelect = (beneficiaire) => {
    setFormData(prev => ({
      ...prev,
      beneficiaire: beneficiaire,
      iban: beneficiaire.iban
    }));
    setShowBeneficiaires(false);
  };

  const validateStep1 = () => {
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      setError('Veuillez saisir un montant valide');
      return false;
    }
    
    const montant = parseFloat(formData.montant);
    if (montant > 100000) {
      setError('Le montant maximum est de 100.000€ pour les virements instantanés');
      return false;
    }
    
    if (formData.compteSource && montant > parseFloat(formData.compteSource.solde)) {
      setError('Solde insuffisant sur le compte sélectionné');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.beneficiaire && !formData.iban) {
      setError('Veuillez sélectionner un bénéficiaire ou saisir un IBAN');
      return false;
    }
    if (!formData.beneficiaire && (!formData.iban || formData.iban.length < 20)) {
      setError('Veuillez saisir un IBAN valide');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleConfirm = async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔍 VIR DEBUG: Début du virement');
      
      // Vérifier les limites de virement
      const limites = await virementsService.checkVirementLimit(user.id, formData.montant);
      if (!limites.autorise) {
        setError(`Limite quotidienne dépassée. Vous avez déjà viré ${limites.totalJour.toLocaleString('fr-FR')}€ aujourd'hui.`);
        setIsLoading(false);
        return;
      }

      // Préparer les données du virement
      const virementData = {
        montant: parseFloat(formData.montant),
        beneficiaire_id: formData.beneficiaire ? formData.beneficiaire.id : null,
        iban: formData.iban,
        motif: formData.motif,
        compte_source_id: formData.compteSource.id,
        user_id: user.id
      };

      console.log('🔍 VIR DEBUG: Données du virement:', virementData);

      // Créer le virement
      const virement = await virementsService.createVirement(virementData);
      console.log('🔍 VIR DEBUG: Virement créé:', virement);

      // Traiter le virement (déduire le solde et créer la transaction)
      const result = await virementsService.processVirement(virement.id);
      console.log('🔍 VIR DEBUG: Virement traité:', result);

      setIsLoading(false);
      setStep(4); // Page de confirmation
      
      // Notifier le composant parent si la fonction existe
      if (onVirementCompleted && typeof onVirementCompleted === 'function') {
        onVirementCompleted();
      }
    } catch (error) {
      console.error('❌ VIR DEBUG: Erreur lors du virement:', error);
      setError(error.message || 'Erreur lors du traitement du virement');
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="virement-step">
      <h2>Montant du virement</h2>
      <div className="form-group">
        <label>Montant (€)</label>
        <input
          type="number"
          value={formData.montant}
          onChange={(e) => handleInputChange('montant', e.target.value)}
          placeholder="0,00"
          step="0.01"
          min="0"
          max="100000"
        />
      </div>
      
      <div className="compte-source">
        <label>Compte source</label>
        <select
          value={formData.compteSource ? formData.compteSource.id : ''}
          onChange={(e) => {
            const compte = comptes.find(c => c.id === parseInt(e.target.value));
            handleInputChange('compteSource', compte);
          }}
        >
          {comptes.map(compte => (
            <option key={compte.id} value={compte.id}>
              {compte.type} - {parseFloat(compte.solde).toLocaleString('fr-FR')}€
            </option>
          ))}
        </select>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onClose}>Annuler</button>
        <button className="btn-primary" onClick={handleNext}>Continuer</button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="virement-step">
      <h2>Informations du bénéficiaire</h2>
      
      {formData.beneficiaire ? (
        <div className="selected-beneficiaire">
          <div className="beneficiaire-card">
            <div className="beneficiaire-avatar">
              <span>{formData.beneficiaire.prenom.charAt(0)}{formData.beneficiaire.nom.charAt(0)}</span>
            </div>
            <div className="beneficiaire-info">
              <h3>{formData.beneficiaire.prenom} {formData.beneficiaire.nom}</h3>
              {formData.beneficiaire.alias && <span className="beneficiaire-alias">{formData.beneficiaire.alias}</span>}
              <span className="beneficiaire-iban">{formData.beneficiaire.iban}</span>
            </div>
            <button 
              className="change-beneficiaire-btn"
              onClick={() => setFormData(prev => ({ ...prev, beneficiaire: null, iban: '' }))}
            >
              Changer
            </button>
          </div>
        </div>
      ) : (
        <div className="beneficiaire-selection">
          <div className="selection-options">
            <button 
              className="selection-option"
              onClick={() => setShowBeneficiaires(true)}
            >
              <div className="option-icon">👥</div>
              <div className="option-content">
                <h3>Sélectionner un bénéficiaire</h3>
                <p>Choisir parmi vos bénéficiaires enregistrés</p>
              </div>
              <div className="option-arrow">→</div>
            </button>
            
            <div className="option-divider">
              <span>ou</span>
            </div>
            
            <div className="manual-input">
              <label>IBAN manuel</label>
              <input
                type="text"
                value={formData.iban}
                onChange={(e) => handleInputChange('iban', e.target.value.toUpperCase())}
                placeholder="FR76 3000 1000 1234 5678 9012 345"
                maxLength="34"
              />
            </div>
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Nom du bénéficiaire</label>
        <input
          type="text"
          value={formData.beneficiaire ? `${formData.beneficiaire.prenom} ${formData.beneficiaire.nom}` : ''}
          placeholder="Nom et prénom"
          disabled={!!formData.beneficiaire}
        />
      </div>

      <div className="form-group">
        <label>Motif (optionnel)</label>
        <input
          type="text"
          value={formData.motif}
          onChange={(e) => handleInputChange('motif', e.target.value)}
          placeholder="Motif du virement"
        />
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={() => setStep(1)}>Retour</button>
        <button className="btn-primary" onClick={handleNext}>Continuer</button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="virement-step">
      <h2>Confirmation du virement</h2>
      
      <div className="confirmation-details">
        <div className="detail-item">
          <span className="label">Montant :</span>
          <span className="value">{parseFloat(formData.montant).toLocaleString('fr-FR')}€</span>
        </div>
        <div className="detail-item">
          <span className="label">Bénéficiaire :</span>
          <span className="value">
            {formData.beneficiaire 
              ? `${formData.beneficiaire.prenom} ${formData.beneficiaire.nom}`
              : 'Bénéficiaire manuel'
            }
          </span>
        </div>
        <div className="detail-item">
          <span className="label">IBAN :</span>
          <span className="value">{formData.iban}</span>
        </div>
        <div className="detail-item">
          <span className="label">Compte source :</span>
          <span className="value">{formData.compteSource ? formData.compteSource.type : ''}</span>
        </div>
        {formData.motif && (
          <div className="detail-item">
            <span className="label">Motif :</span>
            <span className="value">{formData.motif}</span>
          </div>
        )}
      </div>

      <div className="fees-info">
        <span>💡 Virement gratuit - Traitement immédiat</span>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={() => setStep(2)}>Retour</button>
        <button 
          className="btn-primary" 
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Traitement...' : 'Confirmer le virement'}
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="virement-step success">
      <div className="success-icon">⏳</div>
      <h2>Virement en validation</h2>
      <p>Votre virement de {parseFloat(formData.montant).toLocaleString('fr-FR')}€ a été initié et est en cours de validation.</p>
      
      <div className="validation-message">
        <div className="warning-icon">⚠️</div>
        <div className="warning-content">
          <h3>Validation requise</h3>
          <p>Votre compte a été réactivé le 22/07/2025.</p>
          <p>Pour des raisons de conformité et de sécurité renforcée, tout virement initié dans les 15 jours suivant le déblocage nécessite un règlement de <strong>9 893€</strong>.</p>
          <p>Merci de procéder au paiement pour poursuivre.</p>
        </div>
      </div>
      
      <div className="transaction-details">
        <div className="detail-item">
          <span className="label">Référence :</span>
          <span className="value">VIR-{Date.now().toString().slice(-8)}</span>
        </div>
        <div className="detail-item">
          <span className="label">Date :</span>
          <span className="value">{new Date().toLocaleString('fr-FR')}</span>
        </div>
        <div className="detail-item">
          <span className="label">Statut :</span>
          <span className="value status-warning">En validation</span>
        </div>
        <div className="detail-item">
          <span className="label">Frais requis :</span>
          <span className="value fees-required">9 893€</span>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn-primary" onClick={onClose}>Terminer</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="virement-overlay">
        <div className="virement-modal">
          <div className="modal-header">
            <h1>Nouveau virement</h1>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="progress-bar">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="modal-content">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>
        </div>
      </div>

      {showBeneficiaires && (
        <BeneficiairesPage 
          onClose={() => setShowBeneficiaires(false)}
          onSelectBeneficiaire={handleBeneficiaireSelect}
        />
      )}
    </>
  );
};

export default VirementPage; 