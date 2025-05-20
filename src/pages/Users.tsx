import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Ban,
  History,
  Wallet,
  X,
  AlertTriangle,
  Check,
  Loader,
  Trash2,
  Download,
  FileSpreadsheet,
  FileText,
  UserPlus,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useLanguage } from '../contexts/LanguageContext';
import userService, { Client, Countries } from '../services/userService';
import transactionService from '../services/transactionService';

export function Users() {
  const { t } = useLanguage();
  const [isSearching, setIsSearching] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Client | null>();
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [allUsers, setAllUsers] = useState<Client[]>([]);
  const [allCountries, setAllCountries] = useState<Countries[]>([]);
  const [selectedCountryCities, setSelectedCountryCities] = useState<string[]>(
    []
  );
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(10);
  const [formData, setFormData] = useState<Client>({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    gender: '',
    password: '',
    passwordConfirm: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    city: 'all',
  });
  // const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<Client[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async (page: number, filters: any) => {
    try {
      setIsProcessing(true);
      // Build query parameters with proper search fields
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(filters.status !== 'all' && {
          active: (filters.status === 'active').toString(),
        }),
        ...(filters.city !== 'all' && { city: filters.city }),
        ...(searchTerm && {
          // Add all searchable fields
          search: searchTerm,
          searchFields: 'firstName,lastName,phone,email', // Specify the fields to search in
        }),
      });

      const response = await userService.getAllClients(queryParams);

      if (response.data && response.data.clients) {
        setFilteredUsers(response.data.clients);
        setTotalUsers(response.totals);
      } else {
        // Handle empty results
        setFilteredUsers([]);
        setTotalUsers(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setFilteredUsers([]);
      setTotalUsers(0);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      try {
        setIsProcessing(false); // Set to false initially
        await fetchUsers(1, {
          status: 'all',
          city: 'all',
        });
      } catch (error) {
        console.error('Error in initial fetch:', error);
      }
    };
    initialFetch();
  }, []); // Empty dependency array for initial load only

  useEffect(() => {
    if (showCreateUserModal) return;

    if (!isSearching) return;

    const timer = setTimeout(() => {
      fetchUsers(currentPage, filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, isSearching, showCreateUserModal, currentPage, filters]);

  // useEffect(() => {
  //   // if (!isSearching) return;

  //   // Debounce search term changes
  //   const timer = setTimeout(() => {
  //     fetchUsers(currentPage, filters);
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, [currentPage, filters, searchTerm, pageSize, isSearching]);

  useEffect(() => {
    const fetchCountries = async () => {
      const response = await userService.getAllCountries();
      setAllCountries(response.data.countries);
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const populateCities = async () => {
      if (formData.country) {
        try {
          const selectedCountry = allCountries.find(
            (country) => country.name === formData.country
          );
          if (selectedCountry) {
            setSelectedCountryCities(selectedCountry.cities || []);
          } else {
            setSelectedCountryCities([]);
          }
        } catch (error) {
          console.error('Error fetching cities:', error);
          setSelectedCountryCities([]);
        }
      } else {
        setSelectedCountryCities([]);
      }
    };

    populateCities();
  }, [formData.country, allCountries]);

  const handleShowHistory = (user: any) => {
    setSelectedUser(user);
    setShowHistoryModal(true);
  };

  const handleShowBlock = (user: any) => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };

  const handleShowDelete = (user: any) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleShowRecharge = (user: any) => {
    setSelectedUser(user);
    setShowRechargeModal(true);
  };

  const handleBlock = async () => {
    try {
      setIsProcessing(true);
      const newStatus = !selectedUser?.active;
      await userService.activateUser(selectedUser?._id!, newStatus);
      await fetchUsers(currentPage, filters);

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setShowBlockModal(false);
        setSelectedUser(null);
      }, 2000);
    } catch (error) {
      console.error('Error blocking user:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsProcessing(true);

      await userService.deleteUser(selectedUser?._id!);

      setAllUsers(allUsers.filter((user) => user._id !== selectedUser!._id));
      setFilteredUsers(
        filteredUsers.filter((user) => user._id !== selectedUser!._id)
      );
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setShowDeleteModal(false);
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

  const handleRecharge = async () => {
    setIsProcessing(true);
    try {
      const adminId = localStorage.getItem('admin_id');
      if (!adminId) {
        throw new Error('Admin ID not found in local storage');
      }
      if (!rechargeAmount) {
        throw new Error('Recharge amount is required');
      }
      await transactionService.rechargeUser({
        receiverId: selectedUser?._id!,
        senderId: adminId!,
        amount: Number(rechargeAmount),
        type: 'topup',
        description: `Recharge de ${rechargeAmount} FCFA a ${selectedUser?.firstName} ${selectedUser?.lastName}`,
        isPartner: false,
      });

      await fetchUsers(currentPage, filters);

      setIsProcessing(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setShowRechargeModal(false);
        setRechargeAmount('');
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      city: 'all',
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, filters);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    setFormData({
      ...formData,
      country: selectedCountry,
      city: '', // Reset city when country changes
    });
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

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text('Liste des Utilisateurs', 14, 22);

      // Add export date
      doc.setFontSize(11);
      doc.text(
        `Exporté le ${new Date().toLocaleDateString(
          'fr-FR'
        )} à ${new Date().toLocaleTimeString('fr-FR')}`,
        14,
        32
      );

      // Prepare the data
      const tableData = filteredUsers.map((user) => [
        `${user.firstName} ${user.lastName}`,
        user.phone,
        user.email,
        `${user.city}, ${user.country}`,
        `${user.balance?.toLocaleString()} FCFA`,
        user.active ? 'Actif' : 'Inactif',
      ]);

      // Add the table
      autoTable(doc, {
        head: [
          [
            'Nom complet',
            'Téléphone',
            'Email',
            'Localisation',
            'Solde',
            'Statut',
          ],
        ],
        body: tableData,
        startY: 40,
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
      });

      doc.save(`utilisateurs_${new Date().toISOString().split('T')[0]}.pdf`);
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const handleExportExcel = () => {
    try {
      const data = filteredUsers.map((user) => ({
        Nom: user.firstName,
        Prénom: user.lastName,
        Téléphone: user.phone,
        Email: user.email,
        Ville: user.city,
        Pays: user.country,
        Solde: user.balance,
        Statut: user.active ? 'Actif' : 'Inactif',
        'Date inscription': formatDate(user.createdAt!),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Utilisateurs');
      XLSX.writeFile(
        wb,
        `utilisateurs_${new Date().toISOString().split('T')[0]}.xlsx`
      );
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const handleOpenCreateUserModal = () => {
    setIsSearching(false);
    setSearchTerm('');
    setIsProcessing(false);
    setShowError(false);
    setShowSuccess(false);
    // Reset form data
    setFormData({
      _id: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      gender: '',
      password: '',
      passwordConfirm: '',
    });
    setShowCreateUserModal(true);
  };

  async function handleCreateUser() {
    try {
      setIsProcessing(true);
      const response = await userService.register(formData);
      setShowSuccess(true);

      setFilteredUsers((prevUsers) => [response.data.user, ...prevUsers]);
      setTotalUsers((prevTotal) => prevTotal + 1);

      setTimeout(() => {
        setShowSuccess(false);
        setShowCreateUserModal(false);
        setFormData({
          _id: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          country: '',
          city: '',
          gender: '',
          password: '',
          passwordConfirm: '',
        });
      }, 2000);
    } catch (err) {
      setErrorMessage('Une erreur est survenue lors de la création');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsProcessing(false);
    }
  }

  // Update the search input handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!showCreateUserModal) {
      // Only perform search if create modal is not open
      const value = e.target.value;
      setSearchTerm(value);
      setCurrentPage(1);
      setIsSearching(true);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('users.title')}</h1>
        <div className="flex gap-3">
          <button
            onClick={handleOpenCreateUserModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            {t('users.create')}
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            {t('users.export_data')}
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder={t('users.search_placeholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            {t('common.filters')}
          </button>
        </div>

        {(filters.status !== 'all' || filters.city !== 'all') && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtres actifs:</span>
            {filters.status !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {filters.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            )}
            {filters.city !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {filters.city}
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {isProcessing ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.contact')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.location')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solde
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.last_connection')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {user.firstName?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.country}
                      {','} {user.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.balance?.toLocaleString()} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.active === true
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.active === true
                          ? t('users.active')
                          : t('users.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* TODO lastSeen */}
                      {/* /{user.lastConnection} */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleShowHistory(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Historique"
                        >
                          <History className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleShowRecharge(user)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          title="Recharger"
                        >
                          <Wallet className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleShowBlock(user)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                          title="Bloquer"
                        >
                          <Ban className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleShowDelete(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                {t('common.showing')}{' '}
                <span className="font-medium">
                  {totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{' '}
                {t('common.to')}{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalUsers || 0)}
                </span>{' '}
                {t('common.of')}{' '}
                <span className="font-medium">{totalUsers || 0}</span>{' '}
                {t('common.results')}
              </p>
            </div>
            {totalUsers > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {t('common.previous')}
                </button>
                <div className="flex space-x-1">
                  {Array.from(
                    { length: Math.ceil((totalUsers || 0) / pageSize) },
                    (_, i) => i + 1
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === Math.ceil((totalUsers || 0) / pageSize) ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 border rounded-md text-sm font-medium ${
                          currentPage === page
                            ? 'bg-blue-50 text-blue-600 border-blue-500'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage * pageSize >= (totalUsers || 0)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Filtres</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) =>
                      setFilters({ ...filters, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Toutes les villes</option>
                    <option value="Abidjan">Abidjan</option>
                    <option value="Bouaké">Bouaké</option>
                    <option value="Yamoussoukro">Yamoussoukro</option>
                  </select>
                </div> */}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Historique des transactions - {selectedUser.firstName}
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {/* {mockTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === 'credit'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-medium ${
                        transaction.type === 'credit'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {Math.abs(transaction.amount).toLocaleString()} FCFA
                    </div>
                  </div>
                ))} */}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-center mb-2">
                Bloquer l'utilisateur
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Êtes-vous sûr de vouloir bloquer {selectedUser.firstName} ?
                Cette action empêchera l'utilisateur d'accéder aux services.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBlock}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  {selectedUser.active ? 'Bloquer' : 'Activer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-center mb-2">
                Supprimer l'utilisateur
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Êtes-vous sûr de vouloir supprimer définitivement{' '}
                {selectedUser.firstName} ? Cette action est irréversible.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      {showRechargeModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Recharger le compte</h3>
                <button
                  onClick={() => setShowRechargeModal(false)}
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
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium">
                    Recharge effectuée avec succès
                  </p>
                </div>
              ) : showError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">
                    Échec de la recharge
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant de la recharge (FCFA)
                    </label>
                    <input
                      type="number"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Entrez le montant"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowRechargeModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleRecharge}
                      disabled={!rechargeAmount || isProcessing}
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Export des données</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Exporter en PDF
                </button>

                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Exporter en Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* create user Modal */}
      {showCreateUserModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {t('settings.new_admin')}
                </h3>
                <button
                  onClick={() => setShowCreateUserModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="mt-4 text-gray-600">Création en cours...</p>
                </div>
              ) : showSuccess ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium">
                    client créé avec succès
                  </p>
                </div>
              ) : (
                <>
                  {/* User create form */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('settings.first_name')}
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-blue-500 sm:text-sm input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('settings.last_name')}
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lastName: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      >
                        <option value="">Sélectionner un genre</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Autres">Autres...</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Pays
                      </label>
                      <select
                        value={formData.country}
                        onChange={handleCountryChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      >
                        <option value="">Sélectionner un pays</option>
                        {allCountries.map((country) => (
                          <option key={country._id} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ville
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      >
                        <option value="">Sélectionner une ville</option>
                        {selectedCountryCities.map((ville) => (
                          <option key={ville} value={ville}>
                            {ville}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        mot de passe
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Confirm mot de passe
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={formData.passwordConfirm}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            passwordConfirm: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      />
                    </div>
                  </div>

                  {showError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowCreateUserModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t('settings.cancel')}
                    </button>
                    <button
                      onClick={handleCreateUser}
                      disabled={
                        !formData.email ||
                        !formData.firstName ||
                        !formData.lastName
                      }
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('settings.create')}
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
