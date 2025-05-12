import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  Store,
  Wifi,
  DollarSign,
  Percent,
  Calendar,
  TrendingUp,
  Clock,
  Star,
  Bell,
  Download,
  Filter,
  RefreshCcw,
  WalletCards,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AdminAuthService, { DashboardData } from '../services/adminAuthService';

export function Dashboard() {
  const { t } = useLanguage();
  const [timeFilter, setTimeFilter] = useState('week');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>();
  const [stats, setStats] = useState({
    users: 0,
    partners: 0,
    activeConnections: 0,
    zoomWifiCommission: 0,
    kpis: {
      partnerConversionRate: 0,
      averageSessionDuration: '0 min',
      arpu: 0,
      satisfactionRate: 0,
      fiberUsageRate: 0,
    },
  });

  const [revenueHistory, setRevenueHistory] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const timeFilters = [
    { id: 'day', label: "Aujourd'hui" },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'year', label: 'Cette année' },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      const response = await AdminAuthService.getDashboardData();
      //console.log('data:', response);
      setDashboardData(response.data);
    };
    fetchDashboard();
    fetchDashboardData();
  }, [timeFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Simulate API calls with mock data for now
      const mockData = {
        stats: {
          users: 1284,
          partners: 45,
          activeConnections: 167,
          zoomWifiCommission: 1138300,
          kpis: {
            partnerConversionRate: 85,
            averageSessionDuration: '45 min',
            arpu: 2215,
            satisfactionRate: 4.8,
            fiberUsageRate: 65,
          },
        },
        revenueHistory: [
          {
            name: 'Lun',
            totalRevenue: 450000,
            zoomWifiCommission: 180000,
            users: 120,
          },
          {
            name: 'Mar',
            totalRevenue: 520000,
            zoomWifiCommission: 208000,
            users: 145,
          },
          {
            name: 'Mer',
            totalRevenue: 480000,
            zoomWifiCommission: 192000,
            users: 132,
          },
          {
            name: 'Jeu',
            totalRevenue: 590000,
            zoomWifiCommission: 236000,
            users: 168,
          },
          {
            name: 'Ven',
            totalRevenue: 620000,
            zoomWifiCommission: 248000,
            users: 172,
          },
          {
            name: 'Sam',
            totalRevenue: 750000,
            zoomWifiCommission: 300000,
            users: 198,
          },
          {
            name: 'Dim',
            totalRevenue: 680000,
            zoomWifiCommission: 272000,
            users: 185,
          },
        ],
        userActivity: [
          { time: '00:00', users: 45 },
          { time: '03:00', users: 30 },
          { time: '06:00', users: 65 },
          { time: '09:00', users: 120 },
          { time: '12:00', users: 185 },
          { time: '15:00', users: 210 },
          { time: '18:00', users: 235 },
          { time: '21:00', users: 140 },
        ],
        alerts: [
          {
            id: 1,
            type: 'partner_pending',
            message: 'Nouveau partenaire en attente : Restaurant Le Délice',
          },
          {
            id: 2,
            type: 'withdrawal',
            message:
              'Nouvelle demande de retrait : 75,000 FCFA - Cyber Café Express',
          },
          {
            id: 3,
            type: 'long_session',
            message: 'Session > 4h détectée : Hôtel Magnificence',
          },
          {
            id: 4,
            type: 'usage_peak',
            message: "Pic d'utilisation détecté : +150% utilisateurs actifs",
          },
        ],
      };

      setStats(mockData.stats);
      setRevenueHistory(mockData.revenueHistory);
      setUserActivity(mockData.userActivity);
      setAlerts(mockData.alerts);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.title')}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
            {timeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={`px-4 py-2 text-sm ${
                  timeFilter === filter.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button className="btn-primary">
            <Download className="w-5 h-5" />
            {t('dashboard.download_report')}
          </button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.total_users')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.totalUsers}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          {/* <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <p className="text-sm text-green-600">+12% ce mois</p>
          </div> */}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.partners')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.totalPartners}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          {/* <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <p className="text-sm text-green-600">+3 nouveaux</p>
          </div> */}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.totalTransactions}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <RefreshCcw className="w-6 h-6 text-green-600" />
            </div>
          </div>
          {/* <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <p className="text-sm text-green-600">+24% vs hier</p>
          </div> */}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.zoom_commission')}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {/* {stats.zoomWifiCommission.toLocaleString()} FCFA */}
                {dashboardData?.totalRechargeAmount.toLocaleString()} FCFA
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <WalletCards className="w-6 h-6 text-yellow-600" />
              {/* <Percent className="w-6 h-6 text-yellow-600" /> */}
            </div>
          </div>
          {/* <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <p className="text-sm text-green-600">+8% cette semaine</p>
          </div> */}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="card p-6 lg:col-span-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Performance des Revenus
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
                <defs>
                  <linearGradient id="totalRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="#4F46E5"
                  fillOpacity={1}
                  fill="url(#totalRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Indicateurs Clés
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Taux de conversion partenaires
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.kpis.partnerConversionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${stats.kpis.partnerConversionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Durée moyenne session
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.kpis.averageSessionDuration}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div className="w-3/4 h-2 bg-green-500 rounded-full" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">ARPU</span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.kpis.arpu} FCFA
                </span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div className="w-4/5 h-2 bg-yellow-500 rounded-full" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Satisfaction client
                </span>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-900 mr-1">
                    {stats.kpis.satisfactionRate}
                  </span>
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-gray-400 mr-2" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div className="w-[96%] h-2 bg-purple-500 rounded-full" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Utilisation Fibre</span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.kpis.fiberUsageRate}%
                </span>
              </div>
              <div className="flex items-center">
                <Wifi className="w-5 h-5 text-gray-400 mr-2" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${stats.kpis.fiberUsageRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Pattern & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Utilisation par Heure
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Alertes</h2>
            <div className="relative">
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  {alerts?.length || 0}
                </span>
              </div>
              <Bell className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <div className="space-y-4">
            {alerts?.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
              >
                <div className="flex items-start">
                  {alert.type === 'partner_pending' && (
                    <Store className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                  )}
                  {alert.type === 'withdrawal' && (
                    <DollarSign className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                  )}
                  {alert.type === 'long_session' && (
                    <Clock className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" />
                  )}
                  {alert.type === 'usage_peak' && (
                    <TrendingUp className="w-5 h-5 text-purple-500 mt-0.5 mr-3" />
                  )}
                  <div>
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 5 min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
