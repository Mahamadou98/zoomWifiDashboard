import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Phone, Mail, CheckCircle, Wallet, AlertCircle, Globe2, User, X, Ban, Loader } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ivorianCities = [
  'Abidjan',
  'Bouaké',
  'Daloa',
  'Yamoussoukro',
  'Korhogo',
  'San-Pédro',
  'Man',
  'Divo',
  'Gagnoa',
  'Abengourou',
  'Grand-Bassam',
  'Dabou',
  'Bondoukou',
  'Séguéla',
  'Odienné',
  'Sassandra',
  'Dimbokro',
  'Ferkessédougou',
  'Soubré',
  'Agboville'
];

const mockPartners = [
  {
    id: 1,
    businessName: 'Cyber Café Express',
    managerFirstName: 'Jean',
    managerLastName: 'Kouassi',
    email: 'contact@cybercafe-express.com',
    phone: '+225 07 89 12 34',
    address: 'Rue du Commerce, Plateau',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    type: 'Cyber Café',
    connectionTypes: ['fiber', 'data'],
    status: 'active',
    balance: 450000,
    pendingWithdrawal: 75000,
    registrationDate: '2024-03-10'
  },
  {
    id: 2,
    businessName: 'Restaurant Le Délice',
    managerFirstName: 'Sophie',
    managerLastName: 'Bamba',
    email: 'info@ledelice.com',
    phone: '+225 05 67 89 12',
    address: 'Avenue de la République',
    city: 'Bouaké',
    country: 'Côte d\'Ivoire',
    type: 'Restaurant',
    connectionTypes: ['fiber'],
    status: 'pending',
    balance: 280000,
    pendingWithdrawal: 0,
    registrationDate: '2024-03-15'
  },
  {
    id: 3,
    businessName: 'Hôtel Magnificence',
    managerFirstName: 'Paul',
    managerLastName: 'Koffi',
    email: 'contact@hotel-magnificence.com',
    phone: '+225 01 23 45 67',
    address: 'Boulevard de la Marina, Zone 4',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    type: 'Hôtel',
    connectionTypes: ['fiber', 'data'],
    status: 'active',
    balance: 750000,
    pendingWithdrawal: 150000,
    registrationDate: '2024-03-01'
  }
];

export function Partners() {
  const { t } = useLanguage();
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [topupAmount, setTopupAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: 'all',
    balanceRange: 'all',
    pendingWithdrawal: false
  });
  const [filteredPartners, setFilteredPartners] = useState(mockPartners);

  useEffect(() => {
    let result = mockPartners;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(partner => 
        partner.businessName.toLowerCase().includes(searchLower) ||
        `${partner.managerFirstName} ${partner.managerLastName}`.toLowerCase().includes(searchLower)
      );
    }

    if (filters.city !== 'all') {
      result = result.filter(partner => partner.city === filters.city);
    }

    if (filters.balanceRange !== 'all') {
      switch (filters.balanceRange) {
        case 'low':
          result = result.filter(partner => partner.balance < 100000);
          break;
        case 'medium':
          result = result.filter(partner => partner.balance >= 100000 && partner.balance < 500000);
          break;
        case 'high':
          result = result.filter(partner => partner.balance >= 500000);
          break;
      }
    }

    if (filters.pendingWithdrawal) {
      result = result.filter(partner => partner.pendingWithdrawal > 0);
    }

    setFilteredPartners(result);
  }, [searchTerm, filters]);

  const handleValidatePartner = (partner) => {
    setSelectedPartner(partner);
    setShowValidationModal(true);
  };

  const handleDeactivatePartner = (partner) => {
    setSelectedPartner(partner);
    setShowDeactivateModal(true);
  };

  const handleApprovePartner = async () => {
    try {
      setIsProcessing(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the partner's status in the local state
      const updatedPartners = filteredPartners.map(partner => {
        if (partner.id === selectedPartner.id) {
          return {
            ...partner,
            status: 'active'
          };
        }
        return partner;
      });
      
      setFilteredPartners(updatedPartners);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setShowValidationModal(false);
        setSelectedPartner(null);
      }, 2000);
    } catch (error) {
      console.error('Error approving partner:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setShowDeactivateModal(false);
      setSelectedPartner(null);
    } catch (error) {
      console.error('Error deactivating partner:', error);
    }
  };

  const handleShowTopup = (partner) => {
    setSelectedPartner(partner);
    setTopupAmount('');
    setShowTopupModal(true);
  };

  const handleTopup = async () => {
    if (!topupAmount || parseInt(topupAmount) <= 0) return;
    
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowTopupModal(false);
        setTopupAmount('');
      }, 2000);
    } catch (error) {
      console.error('Error processing top-up:', error);
      setIsProcessing(false);
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  const resetFilters = () => {
    setFilters({
      city: 'all',
      balanceRange: 'all',
      pendingWithdrawal: false
    });
  };

  const renderPartnerActions = (partner) => {
    if (partner.status === 'pending') {
      return (
        <button
          onClick={() => handleValidatePartner(partner)}
          className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          {t('partners.validate_registration')}
        </button>
      );
    }

    return (
      <>
        <button 
          onClick={() => handleShowTopup(partner)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Wallet className="w-4 h-4" />
          {t('partners.topup')}
        </button>
        <button
          onClick={() => handleDeactivatePartner(partner)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Ban className="w-4 h-4" />
          Désactiver le compte
        </button>
      </>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('partners.title')}</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {t('partners.export_data')}
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('partners.search_placeholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            {t('common.filters')}
          </button>
        </div>

        {(filters.city !== 'all' || filters.balanceRange !== 'all' || filters.pendingWithdrawal) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Filtres actifs:</span>
            {filters.city !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {filters.city}
              </span>
            )}
            {filters.balanceRange !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {filters.balanceRange === 'low' ? 'Solde < 100k' :
                 filters.balanceRange === 'medium' ? 'Solde 100k-500k' :
                 'Solde > 500k'}
              </span>
            )}
            {filters.pendingWithdrawal && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Retrait en attente
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <div key={partner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{partner.businessName}</h2>
                  <p className="text-sm text-gray-500">
                    {t('partners.registered_on')} {partner.registrationDate}
                  </p>
                </div>
                {partner.status === 'active' ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-600">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-600">{partner.type}</p>

                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  {partner.managerFirstName} {partner.managerLastName}
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {partner.address}
                </div>

                <div className="flex items-center text-gray-600">
                  <Globe2 className="w-4 h-4 mr-2" />
                  {partner.city}, {partner.country}
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600">{t('partners.available_balance')}</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {partner.balance.toLocaleString()} FCFA
                    </p>
                  </div>
                  {partner.pendingWithdrawal > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-yellow-600">{t('partners.pending_withdrawal')}</p>
                      <p className="font-medium text-yellow-600">
                        {partner.pendingWithdrawal.toLocaleString()} FCFA
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {renderPartnerActions(partner)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Validation Modal */}
      {showValidationModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader className="w-8 h-8 text-orange-600 animate-spin" />
                  <p className="mt-4 text-gray-600">Validation en cours...</p>
                </div>
              ) : showSuccess ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium">Partenaire validé avec succès</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-center mb-2">
                    {t('partners.validate_partner_title')}
                  </h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 text-center">
                      {t('partners.validate_partner_message')}:
                    </p>
                    <p className="mt-2 font-medium text-gray-900 text-center">{selectedPartner.businessName}</p>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 text-center">
                        {t('partners.validate_partner_confirmation')}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowValidationModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleApprovePartner}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md"
                    >
                      {t('common.validate')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {showDeactivateModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-center mb-2">
                Désactiver le compte partenaire
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-500 text-center">
                  Êtes-vous sûr de vouloir désactiver le compte de {selectedPartner.businessName} ?
                </p>
                <p className="mt-4 text-sm text-gray-600 text-center">
                  Cette action empêchera le partenaire d'accéder aux services ZOOM WIFI jusqu'à réactivation.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeactivate}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Désactiver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topup Modal */}
      {showTopupModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Recharger le compte partenaire</h3>
                <button
                  onClick={() => setShowTopupModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="mt-4 text-gray-600">Traitement en cours...</p>
                </div>
              ) : showSuccess ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium">Compte crédité avec succès</p>
                </div>
              ) : showError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">Échec de la recharge</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Point de vente
                      </label>
                      <p className="text-gray-900">{selectedPartner.businessName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Responsable
                      </label>
                      <p className="text-gray-900">
                        {selectedPartner.managerFirstName} {selectedPartner.managerLastName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact
                      </label>
                      <p className="text-gray-900">{selectedPartner.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant de la recharge (FCFA)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Entrez le montant"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowTopupModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleTopup}
                      disabled={!topupAmount || parseInt(topupAmount) <= 0}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Valider
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}