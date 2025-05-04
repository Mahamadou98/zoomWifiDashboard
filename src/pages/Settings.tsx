import React, { useState } from 'react';
import { 
  Users, 
  Store, 
  Settings as SettingsIcon, 
  Plus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building, 
  Globe2,
  Percent,
  Wifi,
  AlertCircle,
  Trash2,
  Edit,
  Clock,
  Database,
  Zap,
  X,
  Check,
  Loader
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AdminManagement } from '../components/AdminManagement';

const mockSettings = {
  company: {
    name: 'ZOOM WIFI',
    address: 'Rue du Commerce, Plateau',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    phone: '+225 07 00 00 00',
    email: 'contact@zoomwifi.com'
  },
  commission: {
    zoomWifi: 40,
    partner: 60
  },
  captivePortal: {
    fiber: {
      ratePerMinute: 1.66,
      minimumBalance: 50,
    },
    data: {
      ratePerMB: 0.4,
      hourlyDataLimit: 250,
      hourlyCostLimit: 100,
      minimumBalance: 50,
    }
  }
};

export function Settings() {
  const { t } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(mockSettings.company);
  const [isEditingCompany, setIsEditingCompany] = useState(false);

  const [fiberConfig, setFiberConfig] = useState({
    minBalance: '',
    dataLimit: '',
    rate: ''
  });

  const [dataConfig, setDataConfig] = useState({
    minBalance: '',
    dataLimit: '',
    rate: ''
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyInfoSave = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsEditingCompany(false);
    } catch (error) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5" />
              {t('settings.company_info')}
            </h2>
            {!isEditingCompany && (
              <button
                onClick={() => setIsEditingCompany(true)}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('settings.company_name')}</label>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                disabled={!isEditingCompany}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('settings.email')}</label>
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                disabled={!isEditingCompany}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('settings.phone')}</label>
              <input
                type="tel"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                disabled={!isEditingCompany}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('settings.address')}</label>
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                disabled={!isEditingCompany}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('settings.city')}</label>
              <input
                type="text"
                value={companyInfo.city}
                onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                disabled={!isEditingCompany}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('settings.country')}</label>
              <input
                type="text"
                value={companyInfo.country}
                onChange={(e) => setCompanyInfo({ ...companyInfo, country: e.target.value })}
                disabled={!isEditingCompany}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
          {isEditingCompany && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCompanyInfo(mockSettings.company);
                  setIsEditingCompany(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCompanyInfoSave}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </div>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Percent className="w-5 h-5" />
            {t('settings.commission_config')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('settings.zoom_commission')}</label>
              <input
                type="number"
                value={mockSettings.commission.zoomWifi}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('settings.partner_share')}</label>
              <input
                type="number"
                value={mockSettings.commission.partner}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Globe2 className="w-5 h-5" />
            Configuration par pays
          </h2>
          <div className="space-y-4">
            <div className="w-full max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Sélectionner un pays</option>
                <option value="CI">Côte d'Ivoire</option>
                <option value="NE">Niger</option>
                <option value="SN">Sénégal</option>
                <option value="BF">Burkina Faso</option>
                <option value="ML">Mali</option>
              </select>
            </div>

            {selectedCountry && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-500" />
                      Mode Fibre
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Solde minimum requis
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            value={fiberConfig.minBalance}
                            onChange={(e) => setFiberConfig({
                              ...fiberConfig,
                              minBalance: e.target.value
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-12"
                            placeholder="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">FCFA</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tarif par minute
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            value={fiberConfig.rate}
                            onChange={(e) => setFiberConfig({
                              ...fiberConfig,
                              rate: e.target.value
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-12"
                            placeholder="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">FCFA</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-500" />
                      Mode Data
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Solde minimum requis
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            value={dataConfig.minBalance}
                            onChange={(e) => setDataConfig({
                              ...dataConfig,
                              minBalance: e.target.value
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-12"
                            placeholder="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">FCFA</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tarif par Mo
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            value={dataConfig.rate}
                            onChange={(e) => setDataConfig({
                              ...dataConfig,
                              rate: e.target.value
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-12"
                            placeholder="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">FCFA</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Limite de données par heure
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            value={dataConfig.dataLimit}
                            onChange={(e) => setDataConfig({
                              ...dataConfig,
                              dataLimit: e.target.value
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-12"
                            placeholder="0"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">Mo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      'Enregistrer'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setFiberConfig({ minBalance: '', dataLimit: '', rate: '' });
                      setDataConfig({ minBalance: '', dataLimit: '', rate: '' });
                    }}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <Check className="w-5 h-5" />
              Configuration enregistrée avec succès
            </div>
          )}

          {/* Error Message */}
          {showError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Erreur lors de l'enregistrement
            </div>
          )}
        </div>
      </div>

      {/* Admin Management Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <AdminManagement />
        </div>
      </div>
    </div>
  );
}