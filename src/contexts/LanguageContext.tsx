import React, { createContext, useContext, useState } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Auth
    'auth.email': 'Adresse email',
    'auth.password': 'Mot de passe',
    'auth.signin': 'Se connecter',
    'auth.show_password': 'Afficher le mot de passe',
    'auth.hide_password': 'Masquer le mot de passe',

    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.users': 'Utilisateurs',
    'nav.partners': 'Partenaires',
    'nav.transactions': 'Transactions',
    'nav.sessions': 'Sessions',
    'nav.settings': 'Paramètres',
    'nav.signout': 'Déconnexion',

    // Dashboard
    'dashboard.title': 'Tableau de Bord',
    'dashboard.download_report': 'Télécharger le Rapport',
    'dashboard.total_users': 'Utilisateurs Totaux',
    'dashboard.partners': 'Partenaires',
    'dashboard.active_connections': 'Connexions Actives',
    'dashboard.zoom_commission': 'Commission ZOOM WIFI',
    'dashboard.revenue_distribution': 'Distribution des Revenus',
    'dashboard.detailed_revenue': 'Revenus Détaillés',
    'dashboard.total_revenue': 'Revenu Total',
    'dashboard.partner_share': 'Part Partenaires',
    'dashboard.weekly_overview': 'Aperçu Hebdomadaire',
    'dashboard.recent_activity': 'Activité Récente',

    // Users
    'users.title': 'Gestion des Utilisateurs',
    'users.export_data': 'Exporter les Données',
    'users.search_placeholder': 'Rechercher un utilisateur...',
    'users.user': 'Utilisateur',
    'users.contact': 'Contact',
    'users.location': 'Localisation',
    'users.last_connection': 'Dernière Connexion',
    'users.active': 'Actif',
    'users.inactive': 'Inactif',

    // Partners
    'partners.title': 'Gestion des Partenaires',
    'partners.export_data': 'Exporter les Données',
    'partners.search_placeholder': 'Rechercher un partenaire...',
    'partners.all_statuses': 'Tous les statuts',
    'partners.pending': 'En attente',
    'partners.approved': 'Approuvés',
    'partners.registered_on': 'Inscrit le',
    'partners.available_balance': 'Solde disponible',
    'partners.pending_withdrawal': 'Retrait en attente',
    'partners.validate_registration': 'Valider l\'inscription',
    'partners.topup': 'Recharger',
    'partners.withdrawal_qr': 'QR Retrait',
    'partners.validate_partner_title': 'Valider l\'inscription du partenaire',
    'partners.validate_partner_message': 'Vous êtes sur le point de valider l\'inscription de',
    'partners.validate_partner_confirmation': 'En validant cette inscription, le partenaire pourra commencer à utiliser les services ZOOM WIFI.',

    // Transactions
    'transactions.title': 'Transactions',
    'transactions.new_topup': 'Nouvelle Recharge',
    'transactions.search_placeholder': 'Rechercher une transaction...',
    'transactions.date': 'Date',
    'transactions.type': 'Type',
    'transactions.amount': 'Montant',
    'transactions.zoom_commission': 'Commission ZOOM WIFI',
    'transactions.partner_share': 'Part Partenaire',
    'transactions.details': 'Détails',
    'transactions.status': 'Statut',
    'transactions.actions': 'Actions',
    'transactions.completed': 'Complété',
    'transactions.pending': 'En attente',
    'transactions.partner_topup': 'Recharge Partenaire',
    'transactions.client_direct': 'Recharge Client Direct',
    'transactions.partner_withdrawal': 'Retrait Partenaire',
    'transactions.client_via_partner': 'Recharge via Partenaire',
    'transactions.confirm_withdrawal': 'Confirmer le retrait',
    'transactions.confirm_withdrawal_message': 'Vous êtes sur le point de valider le retrait suivant :',
    'transactions.withdrawal_details': {
      'partner': 'Partenaire',
      'amount': 'Montant',
      'code': 'Code',
      'method': 'Méthode',
      'bank_account': 'Compte bancaire'
    },
    'transactions.validate': 'Valider',
    'transactions.cancel': 'Annuler',

    // Sessions
    'sessions.title': 'Sessions Wi-Fi',
    'sessions.export_data': 'Exporter les Données',
    'sessions.search_placeholder': 'Rechercher une session...',
    'sessions.session': 'Session',
    'sessions.user': 'Utilisateur',
    'sessions.partner': 'Partenaire',
    'sessions.type': 'Type',
    'sessions.data_usage': 'Données',
    'sessions.cost': 'Coût',
    'sessions.status': 'Statut',
    'sessions.actions': 'Actions',
    'sessions.active': 'Active',
    'sessions.completed': 'Terminée',
    'sessions.duration': 'Durée',
    'sessions.connection_type': {
      'fiber': 'Fibre',
      'data': 'Data'
    },
    'sessions.session_details': 'Détails de la Session',
    'sessions.start_time': 'Début de Session',
    'sessions.end_time': 'Fin de Session',
    'sessions.session_in_progress': 'Session en cours',
    'sessions.device_type': 'Type d\'appareil',
    'sessions.connection_speed': 'Vitesse de connexion',
    'sessions.close': 'Fermer',

    // Settings
    'settings.title': 'Paramètres',
    'settings.company_info': 'Informations de l\'Entreprise',
    'settings.company_name': 'Nom de l\'entreprise',
    'settings.email': 'Adresse email',
    'settings.phone': 'Téléphone',
    'settings.address': 'Adresse',
    'settings.city': 'Ville',
    'settings.country': 'Pays',
    'settings.commission_config': 'Configuration des Commissions',
    'settings.zoom_commission': 'Commission ZOOM WIFI (%)',
    'settings.partner_share': 'Part Partenaire (%)',
    'settings.connection_config': 'Configuration des Connexions',
    'settings.fiber_optic': 'Fibre Optique',
    'settings.mobile_data': 'Data Mobile',
    'settings.available_speeds': 'Vitesses disponibles',
    'settings.default_speed': 'Vitesse par défaut',
    'settings.admin_management': 'Gestion des Administrateurs',
    'settings.new_admin': 'Nouvel Admin',
    'settings.admin': 'Administrateur',
    'settings.contact': 'Contact',
    'settings.role': 'Rôle',
    'settings.status': 'Statut',
    'settings.last_login': 'Dernière Connexion',
    'settings.active': 'Actif',
    'settings.first_name': 'Prénom',
    'settings.last_name': 'Nom',
    'settings.cancel': 'Annuler',
    'settings.create': 'Créer',
    'settings.close': 'Fermer',

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.save': 'Enregistrer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.search': 'Rechercher',
    'common.filters': 'Filtres',
    'common.status': 'Statut',
    'common.actions': 'Actions',
    'common.validate': 'Valider',
    'common.cancel': 'Annuler',
    'common.close': 'Fermer',
    'common.previous': 'Précédent',
    'common.next': 'Suivant',
    'common.showing': 'Affichage de',
    'common.to': 'à',
    'common.of': 'sur',
    'common.results': 'résultats'
  },
  en: {
    // Auth
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.signin': 'Sign in',
    'auth.show_password': 'Show password',
    'auth.hide_password': 'Hide password',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.users': 'Users',
    'nav.partners': 'Partners',
    'nav.transactions': 'Transactions',
    'nav.sessions': 'Sessions',
    'nav.settings': 'Settings',
    'nav.signout': 'Sign out',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.download_report': 'Download Report',
    'dashboard.total_users': 'Total Users',
    'dashboard.partners': 'Partners',
    'dashboard.active_connections': 'Active Connections',
    'dashboard.zoom_commission': 'ZOOM WIFI Commission',
    'dashboard.revenue_distribution': 'Revenue Distribution',
    'dashboard.detailed_revenue': 'Detailed Revenue',
    'dashboard.total_revenue': 'Total Revenue',
    'dashboard.partner_share': 'Partner Share',
    'dashboard.weekly_overview': 'Weekly Overview',
    'dashboard.recent_activity': 'Recent Activity',

    // Users
    'users.title': 'User Management',
    'users.export_data': 'Export Data',
    'users.search_placeholder': 'Search for a user...',
    'users.user': 'User',
    'users.contact': 'Contact',
    'users.location': 'Location',
    'users.last_connection': 'Last Connection',
    'users.active': 'Active',
    'users.inactive': 'Inactive',

    // Partners
    'partners.title': 'Partner Management',
    'partners.export_data': 'Export Data',
    'partners.search_placeholder': 'Search for a partner...',
    'partners.all_statuses': 'All statuses',
    'partners.pending': 'Pending',
    'partners.approved': 'Approved',
    'partners.registered_on': 'Registered on',
    'partners.available_balance': 'Available balance',
    'partners.pending_withdrawal': 'Pending withdrawal',
    'partners.validate_registration': 'Validate registration',
    'partners.topup': 'Top up',
    'partners.withdrawal_qr': 'Withdrawal QR',
    'partners.validate_partner_title': 'Validate Partner Registration',
    'partners.validate_partner_message': 'You are about to validate the registration of',
    'partners.validate_partner_confirmation': 'By validating this registration, the partner will be able to start using ZOOM WIFI services.',

    // Transactions
    'transactions.title': 'Transactions',
    'transactions.new_topup': 'New Top-up',
    'transactions.search_placeholder': 'Search for a transaction...',
    'transactions.date': 'Date',
    'transactions.type': 'Type',
    'transactions.amount': 'Amount',
    'transactions.zoom_commission': 'ZOOM WIFI Commission',
    'transactions.partner_share': 'Partner Share',
    'transactions.details': 'Details',
    'transactions.status': 'Status',
    'transactions.actions': 'Actions',
    'transactions.completed': 'Completed',
    'transactions.pending': 'Pending',
    'transactions.partner_topup': 'Partner Top-up',
    'transactions.client_direct': 'Direct Client Top-up',
    'transactions.partner_withdrawal': 'Partner Withdrawal',
    'transactions.client_via_partner': 'Top-up via Partner',
    'transactions.confirm_withdrawal': 'Confirm Withdrawal',
    'transactions.confirm_withdrawal_message': 'You are about to validate the following withdrawal:',
    'transactions.withdrawal_details': {
      'partner': 'Partner',
      'amount': 'Amount',
      'code': 'Code',
      'method': 'Method',
      'bank_account': 'Bank Account'
    },
    'transactions.validate': 'Validate',
    'transactions.cancel': 'Cancel',

    // Sessions
    'sessions.title': 'Wi-Fi Sessions',
    'sessions.export_data': 'Export Data',
    'sessions.search_placeholder': 'Search for a session...',
    'sessions.session': 'Session',
    'sessions.user': 'User',
    'sessions.partner': 'Partner',
    'sessions.type': 'Type',
    'sessions.data_usage': 'Data Usage',
    'sessions.cost': 'Cost',
    'sessions.status': 'Status',
    'sessions.actions': 'Actions',
    'sessions.active': 'Active',
    'sessions.completed': 'Completed',
    'sessions.duration': 'Duration',
    'sessions.connection_type': {
      'fiber': 'Fiber',
      'data': 'Data'
    },
    'sessions.session_details': 'Session Details',
    'sessions.start_time': 'Start Time',
    'sessions.end_time': 'End Time',
    'sessions.session_in_progress': 'Session in progress',
    'sessions.device_type': 'Device Type',
    'sessions.connection_speed': 'Connection Speed',
    'sessions.close': 'Close',

    // Settings
    'settings.title': 'Settings',
    'settings.company_info': 'Company Information',
    'settings.company_name': 'Company name',
    'settings.email': 'Email address',
    'settings.phone': 'Phone',
    'settings.address': 'Address',
    'settings.city': 'City',
    'settings.country': 'Country',
    'settings.commission_config': 'Commission Configuration',
    'settings.zoom_commission': 'ZOOM WIFI Commission (%)',
    'settings.partner_share': 'Partner Share (%)',
    'settings.connection_config': 'Connection Configuration',
    'settings.fiber_optic': 'Fiber Optic',
    'settings.mobile_data': 'Mobile Data',
    'settings.available_speeds': 'Available speeds',
    'settings.default_speed': 'Default speed',
    'settings.admin_management': 'Admin Management',
    'settings.new_admin': 'New Admin',
    'settings.admin': 'Administrator',
    'settings.contact': 'Contact',
    'settings.role': 'Role',
    'settings.status': 'Status',
    'settings.last_login': 'Last Login',
    'settings.active': 'Active',
    'settings.first_name': 'First name',
    'settings.last_name': 'Last name',
    'settings.cancel': 'Cancel',
    'settings.create': 'Create',
    'settings.close': 'Close',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filters': 'Filters',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.validate': 'Validate',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.previous': 'Previous',
    'common.next': 'Next',
    'common.showing': 'Showing',
    'common.to': 'to',
    'common.of': 'of',
    'common.results': 'results'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}