import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Wallet,
  AlertCircle,
  Globe2,
  User,
  X,
  Ban,
  Loader,
  Download,
  FileSpreadsheet,
  FileText,
  Store,
  Check,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import PartnerService, { Partner } from '../services/partnerService';
import transactionService from '../services/transactionService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import userService, { Countries } from '../services/userService';

export function Partners() {
  const { t } = useLanguage();
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreatePartnerModal, setShowCreatePartnerModal] = useState(false);
  const [allCountries, setAllCountries] = useState<Countries[]>([]);
  const [allCities, setAllCities] = useState<any[]>([]);
  const [selectedCountryCities, setSelectedCountryCities] = useState<string[]>(
    []
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<Partner>({
    _id: '',
    establishmentName: '',
    managerFirstName: '',
    managerLastName: '',
    establishmentType: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    connectionType: '',
    password: '',
    passwordConfirm: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    city: 'all',
    balanceRange: 'all',
    pendingWithdrawal: false,
    status: 'all',
  });
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [allPartners, setAllPartners] = useState<Partner[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPartners, setTotalPartners] = useState(0);

  const fetchPartners = async (page: number, filters: any) => {
    try {
      setIsProcessing(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(filters.status !== 'all' && {
          active: (filters.status === 'active').toString(),
        }),
        ...(filters.city !== 'all' && { city: filters.city }),
        // Update the balance filter formatting
        ...(filters.balanceRange !== 'all' && {
          minBalance:
            filters.balanceRange === 'low'
              ? '0'
              : filters.balanceRange === 'medium'
              ? '100000'
              : '500000',
          maxBalance:
            filters.balanceRange === 'low'
              ? '100000'
              : filters.balanceRange === 'medium'
              ? '500000'
              : '',
        }),
        ...(filters.pendingWithdrawal && { pendingWithdrawal: 'true' }),
        ...(searchTerm && {
          search: searchTerm,
          searchFields:
            'establishmentName,managerFirstName,managerLastName,phone,email',
        }),
      });

      const response = await PartnerService.getAllPartners(queryParams);
      if (response.data && response.data.partnes) {
        setAllPartners(response.data.partnes);
        setFilteredPartners(response.data.partnes);

        setTotalPartners(response.totals || 0); // Adjust this according to your API response structure
      } else {
        setAllPartners([]);
        setFilteredPartners([]);
        setTotalPartners(0);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      setAllPartners([]);
      setFilteredPartners([]);
      setTotalPartners(0);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartners(currentPage, filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage, filters, searchTerm, pageSize]);

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

  useEffect(() => {
    const fetchCountries = async () => {
      const response = await userService.getAllCountries();
      setAllCountries(response.data.countries);

      const allCitiesSet = new Set<string>();
      response.data.countries.forEach((country) => {
        country.cities?.forEach((city) => {
          allCitiesSet.add(city);
        });
      });

      const allCitiesList = Array.from(allCitiesSet).sort();
      setAllCities(allCitiesList);
    };
    fetchCountries();
  }, []);

  const handleValidatePartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowValidationModal(true);
  };

  const handleDeactivatePartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowDeactivateModal(true);
  };

  const handleApprovePartner = async () => {
    try {
      const newStatus = !selectedPartner?.active;
      setIsProcessing(true);

      await PartnerService.updatePartnerStatus(selectedPartner!._id, newStatus);
      setShowSuccess(true);
      const updatedPartners = allPartners.map((partner) =>
        partner._id === selectedPartner?._id
          ? { ...partner, active: newStatus }
          : partner
      );

      setAllPartners(updatedPartners);
      setFilteredPartners(updatedPartners); // Reapply filters if needed

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
      const newStatus = !selectedPartner?.active;
      setIsProcessing(true);

      await PartnerService.updatePartnerStatus(selectedPartner!._id, newStatus);
      setShowSuccess(true);
      setShowDeactivateModal(false);
      const updatedPartners = allPartners.map((partner) =>
        partner._id === selectedPartner?._id
          ? { ...partner, active: newStatus }
          : partner
      );

      setAllPartners(updatedPartners);
      setFilteredPartners(updatedPartners); // Reapply filters if needed

      setTimeout(() => {
        setShowSuccess(false);
        setShowDeactivateModal(false);
        setSelectedPartner(null);
      }, 2000);
    } catch (error) {
      console.error('Error deactivating partner:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShowTopup = (partner: Partner) => {
    setSelectedPartner(partner);
    setTopupAmount('');
    setShowTopupModal(true);
  };

  const handleTopup = async () => {
    if (!topupAmount || parseInt(topupAmount) <= 0) return;
    setIsProcessing(true);
    try {
      // await new Promise((resolve) => setTimeout(resolve, 1500));
      const adminId = localStorage.getItem('admin_id');
      if (!adminId) {
        throw new Error('Admin ID not found in local storage');
      }
      if (!topupAmount) {
        throw new Error('Recharge amount is required');
      }
      await transactionService.rechargeUser({
        receiverId: selectedPartner?._id!,
        senderId: adminId!,
        amount: Number(topupAmount),
        type: 'topup',
        description: `Recharge de ${topupAmount} FCFA a ${selectedPartner?.establishmentName}`,
        isPartner: true,
      });

      // await fetchUsers();

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
      pendingWithdrawal: false,
      status: 'all',
    });
    setCurrentPage(1); // Reset to first page when clearing filters
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

  const renderPartnerActions = (partner: Partner) => {
    if (partner.active === false) {
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
          Bloquer
        </button>
      </>
    );
  };

  const handlePageChange = (page: number) => {
    const maxPage = Math.ceil(totalPartners / pageSize);
    if (page < 1 || page > maxPage) return;
    setCurrentPage(page);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text('Liste des Partenaires', 14, 22);

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
      const tableData = filteredPartners.map((partner) => [
        partner.establishmentName,
        `${partner.managerFirstName} ${partner.managerLastName}`,
        partner.phone,
        `${partner.city}, ${partner.country}`,
        `${partner.balance?.toLocaleString()} FCFA`,
        partner.active ? 'Actif' : 'Inactif',
      ]);

      // Add the table
      autoTable(doc, {
        head: [
          [
            'Point de vente',
            'Responsable',
            'Contact',
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

      doc.save(`partenaires_${new Date().toISOString().split('T')[0]}.pdf`);
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const handleExportExcel = () => {
    try {
      const data = filteredPartners.map((partner) => ({
        'Point de vente': partner.establishmentName,
        Responsable: `${partner.managerFirstName} ${partner.managerLastName}`,
        Contact: partner.phone,
        Email: partner.email,
        Adresse: partner.address,
        Ville: partner.city,
        Pays: partner.country,
        'Type établissement': partner.establishmentType,
        Solde: partner.balance,
        'Retrait en attente': partner.pendingWithdrawal || 0,
        Statut: partner.active ? 'Actif' : 'Inactif',
        'Date inscription': formatDate(partner.createdAt!),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Partenaires');
      XLSX.writeFile(
        wb,
        `partenaires_${new Date().toISOString().split('T')[0]}.xlsx`
      );
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    setFormData({
      ...formData,
      country: selectedCountry,
      city: '', // Reset city when country changes
    });
  };

  async function handleCreatePartner() {
    try {
      setIsProcessing(true);
      const response = await PartnerService.register(formData);
      setShowSuccess(true);
      await fetchPartners(currentPage, filters);
      setTimeout(() => {
        setShowSuccess(false);
        setShowCreatePartnerModal(false);
        setFormData({
          _id: '',
          establishmentName: '',
          managerFirstName: '',
          managerLastName: '',
          establishmentType: '',
          email: '',
          phone: '',
          country: '',
          city: '',
          address: '',
          connectionType: '',
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('partners.title')}
        </h1>
        <div className="flex gap-2">
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreatePartnerModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Store className="w-5 h-5" />
              {t('users.create')}
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              {t('partners.export_data')}
            </button>
          </div>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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

        {(filters.status !== 'all' ||
          filters.city !== 'all' ||
          filters.balanceRange !== 'all' ||
          filters.pendingWithdrawal) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
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
            {filters.balanceRange !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {filters.balanceRange === 'low'
                  ? 'Solde < 100k'
                  : filters.balanceRange === 'medium'
                  ? 'Solde 100k-500k'
                  : 'Solde > 500k'}
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {isProcessing ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredPartners.map((partner) => (
                <div
                  key={partner._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {partner.establishmentName}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {t('partners.registered_on')}{' '}
                          {formatDate(partner.createdAt!)}
                        </p>
                      </div>
                      {partner.active === true ? (
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
                      <p className="text-gray-600">
                        {partner.establishmentType}
                      </p>

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
                          <p className="text-sm text-gray-600">
                            {t('partners.available_balance')}
                          </p>
                          <p className="text-xl font-semibold text-gray-900">
                            {partner?.balance?.toLocaleString()} FCFA
                          </p>
                        </div>
                        {partner.pendingWithdrawal! > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <p className="text-yellow-600">
                              {t('partners.pending_withdrawal')}
                            </p>
                            <p className="font-medium text-yellow-600">
                              {partner.pendingWithdrawal!.toLocaleString()} FCFA
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
          )}
        </div>
      </div>

      <div className="bg-white px-4 py-3 border-t border-gray-200 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              {t('common.showing')}{' '}
              <span className="font-medium">
                {totalPartners === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>{' '}
              {t('common.to')}{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, totalPartners)}
              </span>{' '}
              {t('common.of')}{' '}
              <span className="font-medium">{totalPartners}</span>{' '}
              {t('common.results')}
            </p>
          </div>
          {totalPartners > 0 && (
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
                  { length: Math.ceil(totalPartners / pageSize) },
                  (_, i) => i + 1
                )
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === Math.ceil(totalPartners / pageSize) ||
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
                disabled={currentPage * pageSize >= totalPartners}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>
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
                  <p className="text-green-600 font-medium">
                    Partenaire validé avec succès
                  </p>
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
                    <p className="mt-2 font-medium text-gray-900 text-center">
                      {selectedPartner.establishmentName}
                    </p>
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
                  Êtes-vous sûr de vouloir désactiver le compte de{' '}
                  {selectedPartner.establishmentName} ?
                </p>
                <p className="mt-4 text-sm text-gray-600 text-center">
                  Cette action empêchera le partenaire d'accéder aux services
                  ZOOM WIFI jusqu'à réactivation.
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
                  Bloquer
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
                <h3 className="text-lg font-medium">
                  Recharger le compte partenaire
                </h3>
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
                  <p className="text-green-600 font-medium">
                    Compte crédité avec succès
                  </p>
                </div>
              ) : showError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">
                    Échec de la recharge
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Point de vente
                      </label>
                      <p className="text-gray-900">
                        {selectedPartner.establishmentName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Responsable
                      </label>
                      <p className="text-gray-900">
                        {selectedPartner.managerFirstName}{' '}
                        {selectedPartner.managerLastName}
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

                <div>
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
                    {allCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solde
                  </label>
                  <select
                    value={filters.balanceRange}
                    onChange={(e) =>
                      setFilters({ ...filters, balanceRange: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les soldes</option>
                    <option value="low">{'< 100,000 FCFA'}</option>
                    <option value="medium">100,000 - 500,000 FCFA</option>
                    <option value="high">{'> 500,000 FCFA'}</option>
                  </select>
                </div>

                {/* <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pendingWithdrawal"
                    checked={filters.pendingWithdrawal}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        pendingWithdrawal: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="pendingWithdrawal"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Retrait en attente
                  </label>
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
      {showCreatePartnerModal && (
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
                  onClick={() => setShowCreatePartnerModal(false)}
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
                    Partenaire créé avec succès
                  </p>
                </div>
              ) : (
                <>
                  {/* User create form */}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nom de l'etablisement
                      </label>
                      <input
                        type="text"
                        value={formData.establishmentName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            establishmentName: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-blue-500 sm:text-sm input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Prenom du managere
                      </label>
                      <input
                        type="text"
                        value={formData.managerFirstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            managerFirstName: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nom du managere
                      </label>
                      <input
                        type="text"
                        value={formData.managerLastName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            managerLastName: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Type d'etablisement:
                      </label>
                      <select
                        value={formData.establishmentType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            establishmentType: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      >
                        <option value="">Sélectionner un genre</option>
                        <option value="hotel">Hôtel</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="cafe">Café</option>
                        <option value="mall">Centre commercial</option>
                        <option value="office">Bureau</option>
                        <option value="other">Autres...</option>
                      </select>
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
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Type de connection
                      </label>
                      <select
                        value={formData.connectionType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            connectionType: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      >
                        <option value="">Sélectionner un genre</option>
                        <option value="fibre">Fibre</option>
                        <option value="data">Data</option>
                        <option value="both">Les deux</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Confirm mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={formData.passwordConfirm}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              passwordConfirm: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {showError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowCreatePartnerModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t('settings.cancel')}
                    </button>
                    <button
                      onClick={handleCreatePartner}
                      disabled={
                        !formData.email ||
                        !formData.establishmentName ||
                        !formData.managerFirstName ||
                        !formData.managerLastName ||
                        !formData.country ||
                        !formData.connectionType ||
                        !formData.password ||
                        !formData.passwordConfirm
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
