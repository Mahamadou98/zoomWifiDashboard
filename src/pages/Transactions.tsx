import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Wallet, CheckCircle, Clock, User, Store, QrCode, X, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const mockTransactions = [
  {
    id: 1,
    date: '2024-03-15 14:30',
    type: 'partner_topup',
    amount: 100000,
    commission: 40000,
    partnerShare: 60000,
    status: 'completed',
    partner: 'Cyber Café Express',
    paymentMethod: 'Mobile Money',
    transactionId: 'MM-202403151430',
    description: 'Recharge de solde partenaire'
  },
  {
    id: 2,
    date: '2024-03-15 13:15',
    type: 'client_direct',
    amount: 5000,
    commission: 2000,
    partnerShare: 3000,
    status: 'completed',
    client: 'Amadou Diallo',
    paymentMethod: 'Mobile Money',
    transactionId: 'MM-202403151315',
    description: 'Recharge directe via Mobile Money'
  },
  {
    id: 3,
    date: '2024-03-15 12:45',
    type: 'partner_withdrawal',
    amount: -75000,
    status: 'pending',
    partner: 'Hôtel Magnificence',
    paymentMethod: 'Bank Transfer',
    transactionId: 'WD-2024031512',
    description: 'Demande de retrait',
    withdrawalCode: 'WD-2024031512',
    bankDetails: {
      bank: 'BICICI',
      accountNumber: '****3456'
    }
  }
];

export function Transactions() {
  const { t } = useLanguage();
  const [showScanModal, setShowScanModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [scannedCode, setScannedCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleScanClick = () => {
    setShowScanModal(true);
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    const transaction = mockTransactions.find(t => 
      t.type === 'partner_withdrawal' && 
      t.withdrawalCode === scannedCode &&
      t.status === 'pending'
    );

    if (transaction) {
      setSelectedTransaction(transaction);
      setShowScanModal(false);
      setShowValidationModal(true);
      setScannedCode('');
    } else {
      setErrorMessage('Code de retrait invalide ou déjà utilisé');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleValidateWithdrawal = async () => {
    setIsProcessing(true);
    try {
      // Simulation de l'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowValidationModal(false);
        setSelectedTransaction(null);
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      setErrorMessage('Erreur lors de la validation du retrait');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('transactions.title')}</h1>
        <button 
          onClick={handleScanClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <QrCode className="w-5 h-5" />
          Scanner un code de retrait
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('transactions.search_placeholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5" />
            {t('common.filters')}
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.zoom_commission')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.partner_share')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.details')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactions.status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">{transaction.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {transaction.amount > 0 ? (
                        <ArrowUpRight className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className="text-sm text-gray-900">
                        {transaction.type === 'partner_topup' && t('transactions.partner_topup')}
                        {transaction.type === 'client_direct' && t('transactions.client_direct')}
                        {transaction.type === 'partner_withdrawal' && t('transactions.partner_withdrawal')}
                        {transaction.type === 'client_via_partner' && t('transactions.client_via_partner')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{Math.abs(transaction.amount).toLocaleString()} FCFA
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.commission ? (
                      <span className="text-sm text-blue-600 font-medium">
                        {transaction.commission.toLocaleString()} FCFA
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.partnerShare ? (
                      <span className="text-sm text-green-600 font-medium">
                        {transaction.partnerShare.toLocaleString()} FCFA
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-gray-900">
                        {transaction.partner ? (
                          <>
                            <Store className="w-4 h-4" />
                            {transaction.partner}
                          </>
                        ) : null}
                      </div>
                      {transaction.client ? (
                        <div className="flex items-center gap-1 text-gray-500">
                          <User className="w-4 h-4" />
                          {transaction.client}
                        </div>
                      ) : null}
                      <div className="text-gray-500 text-xs mt-1">
                        {transaction.paymentMethod} • {transaction.transactionId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getStatusBadgeColor(transaction.status)
                    }`}>
                      {transaction.status === 'completed' ? t('transactions.completed') : t('transactions.pending')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scan QR Code Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Scanner un code de retrait</h3>
                <button
                  onClick={() => setShowScanModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCodeSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code de retrait
                  </label>
                  <input
                    type="text"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Entrez le code de retrait"
                  />
                </div>

                {showError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {errorMessage}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowScanModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Valider
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {showValidationModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Traitement en cours...</p>
                </div>
              ) : showSuccess ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium">Retrait validé avec succès</p>
                </div>
              ) : showError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">{errorMessage}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-center mb-2">
                    {t('transactions.confirm_withdrawal')}
                  </h3>
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 text-center">
                      {t('transactions.confirm_withdrawal_message')}
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">{t('transactions.withdrawal_details.partner')}:</span>
                        <span className="text-sm text-gray-900">{selectedTransaction.partner}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">{t('transactions.withdrawal_details.amount')}:</span>
                        <span className="text-sm text-gray-900">
                          {Math.abs(selectedTransaction.amount).toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">{t('transactions.withdrawal_details.code')}:</span>
                        <span className="text-sm text-gray-900">{selectedTransaction.withdrawalCode}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">{t('transactions.withdrawal_details.method')}:</span>
                        <span className="text-sm text-gray-900">{selectedTransaction.paymentMethod}</span>
                      </div>
                      {selectedTransaction.bankDetails && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">{t('transactions.withdrawal_details.bank_account')}:</span>
                          <span className="text-sm text-gray-900">
                            {selectedTransaction.bankDetails.bank} ({selectedTransaction.bankDetails.accountNumber})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowValidationModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t('transactions.cancel')}
                    </button>
                    <button
                      onClick={handleValidateWithdrawal}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('transactions.validate')}
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