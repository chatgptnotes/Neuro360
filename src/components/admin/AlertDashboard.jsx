import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import AlertService from '../../services/alertService';
import DatabaseService from '../../services/databaseService';

const AlertDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'critical', 'warning'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    // Start the alert service if not already running
    AlertService.initializeAlertsTable();
    AlertService.start();
    
    return () => {
      // Don't stop the service when component unmounts
      // as it should run globally
    };
  }, []);

  const loadAlerts = () => {
    try {
      const alertsData = AlertService.getAllActiveAlerts();
      const statsData = AlertService.getAlertStats();
      
      setAlerts(alertsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Error loading alerts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = (alertId) => {
    try {
      AlertService.acknowledgeAlert(alertId);
      toast.success('Alert acknowledged');
      loadAlerts();
    } catch (error) {
      toast.error('Error acknowledging alert');
      console.error(error);
    }
  };

  const handleDismissAlert = (alertId) => {
    try {
      AlertService.dismissAlert(alertId);
      toast.success('Alert dismissed');
      loadAlerts();
    } catch (error) {
      toast.error('Error dismissing alert');
      console.error(error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.type === filter;
  });

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBgColor = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getClinicName = (clinicId) => {
    const clinic = DatabaseService.findById('clinics', clinicId);
    return clinic?.name || 'Unknown Clinic';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-gray-900">{stats.critical || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Bell className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.warning || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usage Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.byCategory?.usage || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Active Alerts</h2>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Alerts</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warning Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border p-6 ${getAlertBgColor(alert.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {alert.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alert.type === 'critical' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alert.type}
                      </span>
                      {alert.count > 1 && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {alert.count}x
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mt-1">{alert.message}</p>
                    
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{getClinicName(alert.clinicId)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(alert.createdAt).toLocaleString()}</span>
                      </div>
                      {alert.acknowledged && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Acknowledged</span>
                        </div>
                      )}
                    </div>

                    {alert.data && (
                      <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-md">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Details:</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {alert.category === 'usage' && (
                            <>
                              <div>Reports Used: {alert.data.reportsUsed}</div>
                              <div>Reports Allowed: {alert.data.reportsAllowed}</div>
                              {alert.data.percentage && (
                                <div>Usage: {alert.data.percentage}%</div>
                              )}
                            </>
                          )}
                          {alert.category === 'trial' && (
                            <>
                              {alert.data.daysLeft !== undefined && (
                                <div>Days Left: {alert.data.daysLeft}</div>
                              )}
                              {alert.data.daysExpired !== undefined && (
                                <div>Days Expired: {alert.data.daysExpired}</div>
                              )}
                              <div>Trial End: {new Date(alert.data.trialEndDate).toLocaleDateString()}</div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                      title="Acknowledge Alert"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDismissAlert(alert.id)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Dismiss Alert"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {alert.action && (
                <div className="mt-4 pt-4 border-t border-gray-200 border-opacity-50">
                  <div className="flex space-x-3">
                    {alert.action === 'purchase_reports' && (
                      <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Contact Clinic
                      </button>
                    )}
                    {alert.action === 'consider_purchase' && (
                      <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Notify Clinic
                      </button>
                    )}
                    {alert.action === 'upgrade_subscription' && (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Contact for Upgrade
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No Active Alerts' : `No ${filter} alerts`}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'All systems are running smoothly' 
                : `No ${filter} alerts at this time`
              }
            </p>
          </div>
        )}
      </div>

      {/* Alert Management Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              AlertService.checkAllClinics();
              toast.success('Manual alert check completed');
              loadAlerts();
            }}
            className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <span>Run Alert Check</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span>Alert Settings</span>
          </button>
          
          <button
            onClick={loadAlerts}
            className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-5 w-5 text-gray-600" />
            <span>Refresh Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDashboard;