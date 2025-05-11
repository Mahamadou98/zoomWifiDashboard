import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CheckCircle,
  Clock,
  User,
  Store,
  QrCode,
  X,
  AlertCircle,
  Trash2,
  Ban,
  BookOpenCheck,
  CircleSlash,
  XSquare,
  XOctagon,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import transactionService, {
  TransactionResponse,
} from '../services/transactionService';

export function Transactions() {
  const { t } = useLanguage();
  const [showScanModal, setShowScanModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionResponse | null>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [transactions, setTransactions] = useState<
    TransactionResponse[] | null
  >([]);

  const fetchTransactions = async () => {
    try {
      setIsProcessing(true);
      const response = await transactionService.getAllTransaction();
      setTransactions(response.data.transactions);
      //setFilteredUsers(response.data.clients);
    } catch (err: any) {
      // setErrorMessage(err.message || 'Failed to fetch partners');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleScanClick = () => {
    setShowScanModal(true);
  };

  const handleCodeSubmit = (e: any) => {
    e.preventDefault();
    const transaction = transactions?.find(
      (t) =>
        t.type === 'withdrawal' &&
        // t.withdrawalCode === scannedCode &&
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

  const handleValidateTransaction = async () => {
    setIsProcessing(true);
    try {
      await transactionService.updateTransactionStatus(
        selectedTransaction?._id!,
        'valide'
      );

      await fetchTransactions();

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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'valide':
        return 'bg-green-100 text-green-800';
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'N/A';
    }

    return d.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      // hour12: true,
    });
  };

  function handleShowHistory(transaction: any): void {
    setSelectedTransaction(transaction);
    setShowHistoryModal(true);
  }

  function handleShowDelete(transaction: any): void {
    setSelectedTransaction(transaction);
    setShowDeleteModal(true);
  }

  const handleRejectTransaction = async () => {
    try {
      setIsProcessing(true);

      await transactionService.updateTransactionStatus(
        selectedTransaction?._id!,
        'rejete',
        rejectReason
      );

      await fetchTransactions();

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setShowDeleteModal(false);
        setRejectReason('');
        //setSelectedAdmin(null);
      }, 2000);
    } catch (error) {
      // setErrorMessage('Une erreur est survenue lors de la suppression');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('transactions.title')}
        </h1>
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions?.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {transaction.balance! > 0 ? (
                        <ArrowUpRight className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className="text-sm text-gray-900">
                        {transaction.type === 'topup' &&
                          t('transactions.partner_topup')}
                        {transaction.type === 'direct' &&
                          t('transactions.client_direct')}
                        {transaction.type === 'withdrawal' &&
                          t('transactions.partner_withdrawal')}
                        {transaction.type === 'client_via_partner' &&
                          t('transactions.client_via_partner')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${
                        transaction.balance! > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {Math.abs(transaction.balance!).toLocaleString()} FCFA
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.commission ? (
                      <span className="text-sm text-blue-600 font-medium">
                        {transaction.commission.toLocaleString()} FCFA
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">0 FCFA</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.partnerShare ? (
                      <span className="text-sm text-green-600 font-medium">
                        {transaction.partnerShare.toLocaleString()} FCFA
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">0 FCFA</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-gray-900">
                        {transaction.partner?._id ? (
                          <>
                            <Store className="w-4 h-4" />
                            {transaction.partner.establishmentName}
                          </>
                        ) : null}
                      </div>
                      {transaction.user?._id ? (
                        <div className="flex items-center gap-1 text-gray-500">
                          <User className="w-4 h-4" />
                          {transaction.user.firstName}{' '}
                          {transaction.user.lastName}
                        </div>
                      ) : null}
                      <div className="text-gray-500 text-xs mt-1">
                        {transaction.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                        transaction.status
                      )}`}
                    >
                      {(() => {
                        switch (transaction.status) {
                          case 'valide':
                            return 'complété';
                          case 'rejete':
                            return 'rejeté';
                          case 'en attente':
                            return 'en attente';
                          default:
                            return t('transactions.unknown');
                        }
                      })()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.status === 'en attente' && (
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleShowHistory(transaction)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Valider"
                        >
                          <BookOpenCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleShowDelete(transaction)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Rejeter"
                        >
                          <XOctagon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
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
                <h3 className="text-lg font-medium">
                  Scanner un code de retrait
                </h3>
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
      {showHistoryModal && selectedTransaction && (
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
                  <p className="text-green-600 font-medium">
                    Retrait validé avec succès
                  </p>
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
                      <CheckCheck className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-center mb-2">
                    Confirmer la transaction
                  </h3>
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 text-center">
                      vous etes sur le point de valider la transaction suivante:
                    </p>
                    <div className="mt-4 space-y-3">
                      <p className="text-xl font-medium text-gray-500 text-center">
                        {selectedTransaction.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowHistoryModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t('transactions.cancel')}
                    </button>
                    <button
                      onClick={handleValidateTransaction}
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

      {/* Reject Transaction Confirmation Modal */}
      {showDeleteModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-center mb-2">
                Rejeter la transaction
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                {selectedTransaction.description}.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason:
              </label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Entrez la raison du rejet"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRejectTransaction}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
