import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DatabaseService from '../../services/databaseService';
import ClinicManagement from './ClinicManagement';
import PatientReports from './PatientReports';
import AnalyticsDashboard from './AnalyticsDashboard';
import AlertDashboard from './AlertDashboard';
import DashboardLayout from '../layout/DashboardLayout';
import AdminDashboard from './AdminDashboard';
import SystemSettings from './SystemSettings';
import { useAuth } from '../../contexts/AuthContext';

const SuperAdminPanel = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Get active tab from URL params or default to dashboard
  const activeTab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = DatabaseService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard analytics={analytics} onRefresh={loadAnalytics} />;
      case 'clinics':
        return <ClinicManagement onUpdate={loadAnalytics} />;
      case 'reports':
        return <PatientReports onUpdate={loadAnalytics} />;
      case 'alerts':
        return <AlertDashboard />;
      case 'analytics':
        return <AnalyticsDashboard analytics={analytics} />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <AdminDashboard analytics={analytics} onRefresh={loadAnalytics} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Super Admin Dashboard';
      case 'clinics': return 'Clinic Management';
      case 'reports': return 'Patient Reports';
      case 'alerts': return 'Alerts & Monitoring';
      case 'analytics': return 'Analytics & Reports';
      case 'settings': return 'System Settings';
      default: return 'Super Admin Dashboard';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Super Admin Panel...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={getPageTitle()}>
      <div className="space-y-6">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminPanel;