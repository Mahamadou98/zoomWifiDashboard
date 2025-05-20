import React, { useState, useEffect } from 'react';
import {
  User,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Loader,
  Shield,
  Ban,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AdminAuthService, { Admin } from '../services/adminAuthService';

// Mock data
const mockRoles = [
  { id: '1', name: 'super_admin', description: 'Super Administrateur' },
  { id: '2', name: 'admin', description: 'Administrateur' },
  { id: '3', name: 'support', description: 'Support' },
  {
    id: '4',
    name: 'transactions_admin',
    description: 'Administrateur Transactions',
  },
];

const mockAdmins = [
  {
    id: '1',
    email: 'admin@zoomwifi.com',
    first_name: 'John',
    last_name: 'Doe',
    role_id: '1',
    role: { name: 'super_admin' },
    status: 'active',
    last_login: '2024-03-15 14:30',
  },
  {
    id: '2',
    email: 'support@zoomwifi.com',
    first_name: 'Jane',
    last_name: 'Smith',
    role_id: '3',
    role: { name: 'support' },
    status: 'active',
    last_login: '2024-03-15 12:15',
  },
];

const rolesList = [
  'super administrateur',
  'administrateur',
  'Support',
  'adminstrateur Transaction',
];

export function AdminManagement() {
  const { t } = useLanguage();
  const [admins, setAdmins] = useState<Admin[]>([]);
  // const [admins, setAdmins] = useState(mockAdmins);
  const [roles] = useState(mockRoles);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);

  const [formData, setFormData] = useState<Admin>({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
    passwordConfirm: '',
  });

  const handleCreateAdmin = async () => {
    try {
      setIsProcessing(true);
      const response = await AdminAuthService.register(formData);
      setAdmins([response.data.user, ...admins]);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setShowCreateModal(false);
        setFormData({
          _id: '',
          firstName: '',
          lastName: '',
          email: '',
          role: '',
          password: '',
          passwordConfirm: '',
        });
      }, 2000);
    } catch (error) {
      setErrorMessage('Une erreur est survenue lors de la création');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      setIsProcessing(true);

      await AdminAuthService.deleteAdmin(selectedAdmin._id!);

      setAdmins(admins.filter((admin) => admin._id !== selectedAdmin._id));
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setShowDeleteModal(false);
        setSelectedAdmin(null);
      }, 2000);
    } catch (error) {
      setErrorMessage('Une erreur est survenue lors de la suppression');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleShowBlock = (user: Admin) => {
    setSelectedAdmin(user);
    setShowBlockModal(true);
  };

  const handleBlock = async () => {
    try {
      setIsProcessing(true);

      await AdminAuthService.activateAdmin(
        selectedAdmin?._id!,
        !selectedAdmin?.active!
      );
      setShowSuccess(true);
      //setAdmins([response.data.user, ...admins]);

      setTimeout(() => {
        setShowSuccess(false);
        setShowBlockModal(false);
        setSelectedAdmin(null);
      }, 2000);
    } catch (error) {
      console.error('Error blocking user:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  function formatDateToLastLogin(dateString?: string): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsProcessing(true);
        setErrorMessage('null');
        const response = await AdminAuthService.getAllAdmins();
        setAdmins(response.data.admins);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to fetch partners');
      } finally {
        setIsProcessing(false);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          {t('settings.admin_management')}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('settings.new_admin')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un administrateur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div> */}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('settings.admin')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('settings.contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('settings.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('settings.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('settings.last_login')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.firstName} {admin.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{admin.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Shield className="w-4 h-4 mr-1 text-blue-600" />
                      {admin?.role || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.active === true
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {admin.active === true ? t('settings.active') : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* TODO Last seen */}
                    {formatDateToLastLogin(admin?.lastSeen!) || 'Jamais'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShowBlock(admin)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                      title="Bloquer"
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {t('settings.new_admin')}
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
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
                    Administrateur créé avec succès
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
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
                        mot de passe
                      </label>
                      <input
                        type="email"
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
                        type="email"
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rôle
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm input"
                      >
                        <option value="">Sélectionner un rôle</option>
                        {rolesList.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {showError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t('settings.cancel')}
                    </button>
                    <button
                      onClick={handleCreateAdmin}
                      disabled={
                        !formData.email ||
                        !formData.firstName ||
                        !formData.lastName ||
                        !formData.role
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="mt-4 text-gray-600">Suppression en cours...</p>
                </div>
              ) : showSuccess ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium">
                    Administrateur supprimé avec succès
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-center mb-2">
                    Supprimer l'administrateur
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6">
                    Êtes-vous sûr de vouloir supprimer l'administrateur{' '}
                    {selectedAdmin.firstName} {selectedAdmin.lastName} ? Cette
                    action est irréversible.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleDeleteAdmin}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockModal && selectedAdmin && (
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
                Êtes-vous sûr de vouloir bloquer {selectedAdmin.firstName} ?
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
                  {selectedAdmin.active === true ? 'Bloquer' : 'Activer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
