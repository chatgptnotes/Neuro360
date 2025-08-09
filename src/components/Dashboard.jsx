import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Shield, 
  Settings, 
  Bell, 
  Activity,
  Calendar,
  Mail,
  Users,
  FileText,
  CreditCard,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        );
      case 'github':
        return (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );
      case 'facebook':
        return (
          <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Neuro360</h1>
              <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full font-medium">
                Dashboard
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600">Here&apos;s what&apos;s happening with your account today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Type</span>
                  <div className="flex items-center space-x-2">
                    {getProviderIcon(user?.provider)}
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {user?.provider || 'Email'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>

              <button className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Security Score</p>
                    <p className="text-2xl font-bold text-gray-900">98%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Days Active</p>
                    <p className="text-2xl font-bold text-gray-900">7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Successful login</p>
                    <p className="text-xs text-gray-600">Just now</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Account created</p>
                    <p className="text-xs text-gray-600">Today</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Settings className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Security settings updated</p>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* NeuroSense360 Portals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">NeuroSense360 Portals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  to="/admin"
                  className="group p-6 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 group-hover:bg-red-200 rounded-lg transition-colors">
                      <Shield className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Super Admin Panel</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Manage clinics, upload reports, view analytics
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                        <span>• Clinic Management</span>
                        <span>• Report Upload</span>
                        <span>• Analytics</span>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/clinic"
                  className="group p-6 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Clinic Portal</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Manage patients, view reports, track usage
                      </p>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                        <span>• Patient Management</span>
                        <span>• Report Viewing</span>
                        <span>• Usage Tracking</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  to="/admin"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Analytics</span>
                </Link>
                
                <Link
                  to="/clinic"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Reports</span>
                </Link>
                
                <Link
                  to="/clinic/subscription"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CreditCard className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Billing</span>
                </Link>
                
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Settings className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
