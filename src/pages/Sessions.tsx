import React, { useState } from 'react';
import { Search, Filter, Wifi, Clock, Store, User, Battery, Download, MoreVertical, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const mockSessions = [
  {
    id: 1,
    startTime: '2024-03-15 14:30',
    endTime: null,
    userId: 'USR001',
    userName: 'Amadou Diallo',
    partnerId: 'PTR001',
    partnerName: 'Cyber Café Express',
    connectionType: 'fiber',
    dataUsed: 256, // MB
    duration: '01:30:00',
    cost: 1500,
    status: 'active',
    speed: '10 Mbps',
    deviceType: 'Laptop'
  },
  {
    id: 2,
    startTime: '2024-03-15 13:15',
    endTime: '2024-03-15 14:15',
    userId: 'USR002',
    userName: 'Marie Koné',
    partnerId: 'PTR002',
    partnerName: 'Restaurant Le Délice',
    connectionType: 'data',
    dataUsed: 128, // MB
    duration: '01:00:00',
    cost: 1000,
    status: 'completed',
    speed: '5 Mbps',
    deviceType: 'Mobile'
  },
  {
    id: 3,
    startTime: '2024-03-15 12:45',
    endTime: '2024-03-15 13:45',
    userId: 'USR003',
    userName: 'Ibrahim Touré',
    partnerId: 'PTR003',
    partnerName: 'Hôtel Magnificence',
    connectionType: 'fiber',
    dataUsed: 512, // MB
    duration: '01:00:00',
    cost: 2000,
    status: 'completed',
    speed: '20 Mbps',
    deviceType: 'Tablet'
  }
];

export function Sessions() {
  const { t } = useLanguage();
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDataUsage = (mb) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb} MB`;
  };

  const getConnectionTypeIcon = (type) => {
    switch (type) {
      case 'fiber':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'data':
        return <Wifi className="w-4 h-4 text-blue-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('sessions.title')}</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t('sessions.export_data')}
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('sessions.search_placeholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5" />
            {t('common.filters')}
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.session')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.partner')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.data_usage')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.cost')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {session.startTime}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {t('sessions.duration')}: {session.duration}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {session.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {session.userId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Store className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-900">{session.partnerName}</div>
                        <div className="text-sm text-gray-500">ID: {session.partnerId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getConnectionTypeIcon(session.connectionType)}
                      <span className="ml-2 text-sm text-gray-900">
                        {t(`sessions.connection_type.${session.connectionType}`)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {session.speed}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDataUsage(session.dataUsed)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.deviceType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {session.cost.toLocaleString()} FCFA
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getStatusBadgeColor(session.status)
                    }`}>
                      {session.status === 'active' ? t('sessions.active') : t('sessions.completed')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(session)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Modal */}
      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {t('sessions.session_details')}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">{t('sessions.close')}</span>
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('sessions.user')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedSession.userName}</p>
                  <p className="text-xs text-gray-500">ID: {selectedSession.userId}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('sessions.partner')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedSession.partnerName}</p>
                  <p className="text-xs text-gray-500">ID: {selectedSession.partnerId}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('sessions.type')}</h4>
                  <div className="mt-1 flex items-center">
                    {getConnectionTypeIcon(selectedSession.connectionType)}
                    <span className="ml-2 text-sm text-gray-900">
                      {t(`sessions.connection_type.${selectedSession.connectionType}`)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{t('sessions.connection_speed')}: {selectedSession.speed}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('sessions.start_time')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedSession.startTime}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('sessions.end_time')}</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedSession.endTime || t('sessions.session_in_progress')}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('sessions.duration')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedSession.duration}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('sessions.data_usage')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{formatDataUsage(selectedSession.dataUsed)}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">{t('sessions.cost')}</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedSession.cost.toLocaleString()} FCFA</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                {t('sessions.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}