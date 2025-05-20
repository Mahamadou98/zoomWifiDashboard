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
  ArrowUpFromLine,
  X,
  Loader,
  CheckCircle,
  AlertCircle,
  Landmark,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AdminAuthService, { DashboardData } from '../services/adminAuthService';
import CompanyService, { Company } from '../services/companyService';
import transactionService from '../services/transactionService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const getDateRange = (filterId: string) => {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (filterId) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'year':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

export function Dashboard() {
  const { t } = useLanguage();
  const [timeFilter, setTimeFilter] = useState('month');
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

  const [revenueHistory, setRevenueHistory] = useState<any>([]);
  const [userActivity, setUserActivity] = useState<any>([]);
  const [alerts, setAlerts] = useState<any>([]);

  const [companyInfo, setCompanyInfo] = useState<Company>();
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [retraitAmount, setRetraitAmount] = useState('');
  const [showError, setShowError] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const timeFilters = [
    { id: 'day', label: "Aujourd'hui" },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'year', label: 'Cette année' },
  ];

  const arpu = (
    companyInfo?.balance! /
    (dashboardData?.totalUsers! + dashboardData?.totalPartners!)
  ).toLocaleString();

  // const computeKPIs = (dashboardData: DashboardData) => {
  //   // Partner Conversion Rate = (Active Partners / Total Partners) * 100
  //   const partnerConversionRate =
  //     dashboardData.totalPartners > 0
  //       ? Math.round(
  //           (dashboardData.activePartners! / dashboardData.totalPartners) * 100
  //         )
  //       : 0;

  //   // Average Revenue Per User (ARPU) = Total Revenue / Total Users
  //   const arpu =
  // dashboardData.totalUsers > 0
  //   ? Math.round(
  //       dashboardData.totalRechargeAmount / dashboardData.totalUsers
  //     )
  //   : 0;

  //   // Average Session Duration (in minutes)
  //   const averageSessionDuration =
  //     dashboardData.totalSessionDuration && dashboardData.totalSessions
  //       ? `${Math.round(
  //           dashboardData.totalSessionDuration / dashboardData.totalSessions
  //         )} min`
  //       : '0 min';

  //   // Satisfaction Rate (from user ratings)
  //   const satisfactionRate =
  //     dashboardData.totalRatings! > 0
  //       ? Number(
  //           (
  //             dashboardData.totalRatingSum! / dashboardData.totalRatings!
  //           ).toFixed(1)
  //         )
  //       : 0;

  //   // Fiber Usage Rate = (Fiber Sessions / Total Sessions) * 100
  //   const fiberUsageRate =
  //     dashboardData.totalSessions! > 0
  //       ? Math.round(
  //           (dashboardData.fiberSessions! / dashboardData.totalSessions!) * 100
  //         )
  //       : 0;

  //   return {
  //     partnerConversionRate,
  //     averageSessionDuration,
  //     arpu,
  //     satisfactionRate,
  //     fiberUsageRate,
  //   };
  // };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange(timeFilter);

      const response = await AdminAuthService.getDashboardData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchDashboardData();
  }, [timeFilter]);

  useEffect(() => {
    const fetchCompany = async () => {
      const response = await CompanyService.getAllCompany();
      setCompanyInfo(response.data.company);
    };
    fetchCompany();
  }, []);

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

  async function handleRetrait() {
    if (!retraitAmount || parseInt(retraitAmount) <= 0) return;
    setIsProcessing(true);
    try {
      const adminId = localStorage.getItem('admin_id');

      if (!adminId) {
        throw new Error('Admin ID not found in local storage');
      }

      await transactionService.adminRetrait({
        senderId: adminId!,
        amount: Number(retraitAmount),
        type: 'withdrowal',
        description: `Retrait de ${retraitAmount} FCFA par Zoom wifi administrateur`,
      });

      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowTopupModal(false);
        setRetraitAmount('');
      }, 2000);
    } catch (err) {
      console.error('Error processing top-up:', err);
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  }

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text('Rapport Dashboard Zoom Wifi', 14, 22);

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
      const dashboardStats = [
        ['Total Utilisateurs', dashboardData?.totalUsers?.toString() || '0'],
        ['Total Partenaires', dashboardData?.totalPartners?.toString() || '0'],
        [
          'Montant Total Rechargé',
          `${dashboardData?.totalRechargeAmount?.toLocaleString() || '0'} FCFA`,
        ],
        [
          'Commission Zoom Wifi',
          `${companyInfo?.balance?.toLocaleString() || '0'} FCFA`,
        ],
      ];

      // Add the table
      autoTable(doc, {
        head: [['Métrique', 'Valeur']],
        body: dashboardStats,
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

      doc.save(
        `rapport_dashboard_${new Date().toISOString().split('T')[0]}.pdf`
      );
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const handleExportExcel = () => {
    try {
      const data = [
        {
          Métrique: 'Total Utilisateurs',
          Valeur: dashboardData?.totalUsers || 0,
        },
        {
          Métrique: 'Total Partenaires',
          Valeur: dashboardData?.totalPartners || 0,
        },
        {
          Métrique: 'Montant Total Rechargé',
          Valeur: dashboardData?.totalRechargeAmount || 0,
        },
        {
          Métrique: 'Commission Zoom Wifi',
          Valeur: companyInfo?.balance || 0,
        },
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      // Add some styling
      ws['!cols'] = [{ wch: 20 }, { wch: 15 }];

      XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
      XLSX.writeFile(
        wb,
        `rapport_dashboard_${new Date().toISOString().split('T')[0]}.xlsx`
      );
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">
        {t('dashboard.title')}
      </h1>
      <div className="flex justify-between">
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
        <div className="flex gap-5 w-100 items-center">
          <button
            className="btn-primary"
            onClick={() => {
              setShowTopupModal(true);
            }}
          >
            <ArrowUpFromLine className="w-5 h-5" />
            Retrait
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            {t('dashboard.download_report')}
          </button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                {/* {t('dashboard.zoom_commission')} */}
                Montant total rechargé
              </p>
              <p className="text-xl font-bold text-gray-900">
                {/* {stats.zoomWifiCommission.toLocaleString()} FCFA */}
                {dashboardData?.totalRechargeAmount.toLocaleString()}
              </p>
              <span className="text-gray-600 font-bold"> FCFA</span>
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
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t('dashboard.zoom_commission')}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {/* {stats.zoomWifiCommission.toLocaleString()} FCFA */}
                {companyInfo?.balance.toLocaleString()}
              </p>
              <span className="text-gray-600 font-bold"> FCFA</span>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Landmark className="w-6 h-6 text-indigo-600" />

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
                  {(dashboardData?.totalPartners! / 100) * 100}%
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
                  {arpu}
                  <span className="text-sm text-gray-500 px-2">FCFA</span>
                </span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div className="w-1/4 h-2 bg-yellow-500 rounded-full" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Utilisation Fibre</span>
                <span className="text-lg font-bold text-gray-900">{0}%</span>
              </div>
              <div className="flex items-center">
                <Wifi className="w-5 h-5 text-gray-400 mr-2" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${0}%` }}
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
            {alerts?.map((alert: any) => (
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

      {/* Retrait Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-md text-gray-600 font-bold">
                  Effectue un retrait dans le compte de zoom wifi
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
                      <p className="text-gray-500 text-sm">
                        vous etes entrain d'effectuer un retrait sur le compte
                        de zoom wifi.
                      </p>
                      <p className="mt-2 mb-2 text-gray-500 font-semibold">
                        montant total: {companyInfo?.balance! | 0} (FCFA)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant du retrait (FCFA)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={retraitAmount}
                        onChange={(e) => setRetraitAmount(e.target.value)}
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
                      onClick={handleRetrait}
                      disabled={
                        !retraitAmount ||
                        parseInt(retraitAmount) <= 0 ||
                        parseInt(retraitAmount) >= companyInfo?.balance!
                      }
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
                <h3 className="text-lg font-medium">Export du rapport</h3>
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
    </div>
  );
}
