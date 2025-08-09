import DatabaseService from './databaseService';
import toast from 'react-hot-toast';

class AlertService {
  constructor() {
    this.alertThresholds = {
      warning: 0.8, // 80% usage
      critical: 1.0, // 100% usage
      trial: 7 // days left in trial
    };
    
    this.checkIntervalId = null;
    this.isRunning = false;
  }

  // Start the automated alert system
  start() {
    if (this.isRunning) {
      console.log('Alert service already running');
      return;
    }

    this.isRunning = true;
    // Check alerts every 5 minutes (300000ms)
    this.checkIntervalId = setInterval(() => {
      this.checkAllClinics();
    }, 300000);

    // Run initial check
    this.checkAllClinics();
    console.log('Alert service started');
  }

  // Stop the automated alert system
  stop() {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
    this.isRunning = false;
    console.log('Alert service stopped');
  }

  // Check all clinics for alerts
  checkAllClinics() {
    try {
      const clinics = DatabaseService.get('clinics');
      
      clinics.forEach(clinic => {
        if (clinic.isActive) {
          this.checkClinicUsage(clinic);
          this.checkTrialStatus(clinic);
        }
      });
    } catch (error) {
      console.error('Error checking clinic alerts:', error);
    }
  }

  // Check clinic usage and generate alerts
  checkClinicUsage(clinic) {
    const usagePercentage = (clinic.reportsUsed || 0) / (clinic.reportsAllowed || 10);
    
    // Critical alert - 100% or more usage
    if (usagePercentage >= this.alertThresholds.critical) {
      this.createAlert(clinic.id, {
        type: 'critical',
        category: 'usage',
        title: 'Report Limit Reached',
        message: `Clinic ${clinic.name} has used all ${clinic.reportsAllowed || 10} allocated reports.`,
        action: 'purchase_reports',
        data: {
          reportsUsed: clinic.reportsUsed || 0,
          reportsAllowed: clinic.reportsAllowed || 10
        }
      });
    }
    // Warning alert - 80% or more usage
    else if (usagePercentage >= this.alertThresholds.warning) {
      this.createAlert(clinic.id, {
        type: 'warning',
        category: 'usage',
        title: 'Report Limit Warning',
        message: `Clinic ${clinic.name} has used ${Math.round(usagePercentage * 100)}% of their allocated reports.`,
        action: 'consider_purchase',
        data: {
          reportsUsed: clinic.reportsUsed || 0,
          reportsAllowed: clinic.reportsAllowed || 10,
          percentage: Math.round(usagePercentage * 100)
        }
      });
    }
  }

  // Check trial status
  checkTrialStatus(clinic) {
    if (clinic.subscriptionStatus === 'trial' && clinic.trialEndDate) {
      const endDate = new Date(clinic.trialEndDate);
      const now = new Date();
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 0) {
        // Trial expired
        this.createAlert(clinic.id, {
          type: 'critical',
          category: 'trial',
          title: 'Trial Expired',
          message: `Trial period for clinic ${clinic.name} has expired.`,
          action: 'upgrade_subscription',
          data: {
            trialEndDate: clinic.trialEndDate,
            daysExpired: Math.abs(daysLeft)
          }
        });
        
        // Deactivate clinic if trial expired
        DatabaseService.update('clinics', clinic.id, {
          subscriptionStatus: 'expired',
          isActive: false
        });
      }
      else if (daysLeft <= this.alertThresholds.trial) {
        // Trial ending soon
        this.createAlert(clinic.id, {
          type: 'warning',
          category: 'trial',
          title: 'Trial Ending Soon',
          message: `Trial for clinic ${clinic.name} will expire in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`,
          action: 'upgrade_subscription',
          data: {
            trialEndDate: clinic.trialEndDate,
            daysLeft: daysLeft
          }
        });
      }
    }
  }

  // Create an alert record
  createAlert(clinicId, alertData) {
    const alertId = `${clinicId}_${alertData.category}_${alertData.type}`;
    
    // Check if similar alert already exists and is recent
    const existingAlert = this.getRecentAlert(clinicId, alertData.category, alertData.type);
    if (existingAlert) {
      // Update existing alert instead of creating duplicate
      DatabaseService.update('alerts', existingAlert.id, {
        ...alertData,
        updatedAt: new Date().toISOString(),
        count: (existingAlert.count || 1) + 1
      });
      return existingAlert;
    }

    // Create new alert
    const alert = DatabaseService.add('alerts', {
      id: alertId,
      clinicId,
      ...alertData,
      status: 'active',
      count: 1,
      acknowledged: false
    });

    // Show toast notification for critical alerts
    if (alertData.type === 'critical') {
      toast.error(alertData.message, { duration: 8000 });
    } else if (alertData.type === 'warning') {
      toast.error(alertData.message, { duration: 6000 });
    }

    // Log alert activity
    DatabaseService.add('usage', {
      clinicId,
      action: 'alert_created',
      details: {
        alertType: alertData.type,
        alertCategory: alertData.category,
        alertTitle: alertData.title
      },
      timestamp: new Date().toISOString()
    });

    return alert;
  }

  // Get recent alert of same type to avoid duplicates
  getRecentAlert(clinicId, category, type) {
    const alerts = DatabaseService.get('alerts') || [];
    const recentThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    return alerts.find(alert => 
      alert.clinicId === clinicId &&
      alert.category === category &&
      alert.type === type &&
      alert.status === 'active' &&
      new Date(alert.createdAt) > recentThreshold
    );
  }

  // Get active alerts for a clinic
  getClinicAlerts(clinicId, activeOnly = true) {
    const alerts = DatabaseService.findBy('alerts', 'clinicId', clinicId);
    
    if (activeOnly) {
      return alerts.filter(alert => alert.status === 'active');
    }
    
    return alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Get all active alerts across all clinics
  getAllActiveAlerts() {
    const alerts = DatabaseService.get('alerts') || [];
    return alerts
      .filter(alert => alert.status === 'active')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Acknowledge an alert
  acknowledgeAlert(alertId) {
    const alert = DatabaseService.findById('alerts', alertId);
    if (alert) {
      DatabaseService.update('alerts', alertId, {
        acknowledged: true,
        acknowledgedAt: new Date().toISOString()
      });
      
      // Log acknowledgment
      DatabaseService.add('usage', {
        clinicId: alert.clinicId,
        action: 'alert_acknowledged',
        details: {
          alertId: alertId,
          alertType: alert.type,
          alertCategory: alert.category
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Dismiss/resolve an alert
  dismissAlert(alertId) {
    const alert = DatabaseService.findById('alerts', alertId);
    if (alert) {
      DatabaseService.update('alerts', alertId, {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });
      
      // Log dismissal
      DatabaseService.add('usage', {
        clinicId: alert.clinicId,
        action: 'alert_dismissed',
        details: {
          alertId: alertId,
          alertType: alert.type,
          alertCategory: alert.category
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get alert statistics
  getAlertStats() {
    const alerts = DatabaseService.get('alerts') || [];
    const activeAlerts = alerts.filter(alert => alert.status === 'active');
    
    const stats = {
      total: alerts.length,
      active: activeAlerts.length,
      critical: activeAlerts.filter(alert => alert.type === 'critical').length,
      warning: activeAlerts.filter(alert => alert.type === 'warning').length,
      byCategory: {}
    };
    
    // Group by category
    activeAlerts.forEach(alert => {
      stats.byCategory[alert.category] = (stats.byCategory[alert.category] || 0) + 1;
    });
    
    return stats;
  }

  // Send email notifications (mock implementation)
  async sendEmailNotification(alert, clinic) {
    // In production, this would integrate with an email service
    console.log(`Mock Email Notification:
      To: ${clinic.email}
      Subject: ${alert.title}
      Message: ${alert.message}
      Type: ${alert.type}
    `);
    
    // Simulate email sending delay
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Initialize alerts table if it doesn't exist
  initializeAlertsTable() {
    if (!localStorage.getItem('alerts')) {
      localStorage.setItem('alerts', JSON.stringify([]));
    }
  }
}

export default new AlertService();