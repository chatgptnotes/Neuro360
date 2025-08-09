import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  FileText, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';

const ClinicManagement = ({ onUpdate }) => {
  const [clinics, setClinics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = () => {
    try {
      const clinicsData = DatabaseService.get('clinics');
      setClinics(clinicsData);
    } catch (error) {
      toast.error('Error loading clinics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClinic = (data) => {
    try {
      const clinicData = {
        ...data,
        adminPassword: 'clinic123', // Default password
        contactPerson: data.contactPerson || data.name
      };
      
      DatabaseService.createClinic(clinicData);
      toast.success('Clinic created successfully');
      loadClinics();
      setShowModal(false);
      reset();
      onUpdate?.();
    } catch (error) {
      toast.error('Error creating clinic');
      console.error(error);
    }
  };

  const handleEditClinic = (data) => {
    try {
      DatabaseService.update('clinics', selectedClinic.id, data);
      toast.success('Clinic updated successfully');
      loadClinics();
      setShowModal(false);
      setSelectedClinic(null);
      reset();
      onUpdate?.();
    } catch (error) {
      toast.error('Error updating clinic');
      console.error(error);
    }
  };

  const handleDeactivateClinic = (clinicId) => {
    if (window.confirm('Are you sure you want to deactivate this clinic?')) {
      try {
        const clinic = DatabaseService.findById('clinics', clinicId);
        DatabaseService.update('clinics', clinicId, { 
          isActive: !clinic.isActive 
        });
        toast.success(`Clinic ${clinic.isActive ? 'deactivated' : 'activated'} successfully`);
        loadClinics();
        onUpdate?.();
      } catch (error) {
        toast.error('Error updating clinic status');
        console.error(error);
      }
    }
  };

  const handleDeleteClinic = (clinicId) => {
    if (window.confirm('Are you sure you want to delete this clinic? This action cannot be undone.')) {
      try {
        DatabaseService.delete('clinics', clinicId);
        toast.success('Clinic deleted successfully');
        loadClinics();
        onUpdate?.();
      } catch (error) {
        toast.error('Error deleting clinic');
        console.error(error);
      }
    }
  };

  const openModal = (clinic = null) => {
    setSelectedClinic(clinic);
    if (clinic) {
      reset(clinic);
    } else {
      reset({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClinic(null);
    reset({});
  };

  const viewClinicDetails = (clinic) => {
    setSelectedClinic(clinic);
    setViewMode('details');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (viewMode === 'details' && selectedClinic) {
    return <ClinicDetails 
      clinic={selectedClinic} 
      onBack={() => {setViewMode('list'); setSelectedClinic(null);}} 
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinic Management</h2>
          <p className="text-gray-600">Manage registered clinics and their accounts</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Clinic</span>
        </button>
      </div>

      {/* Clinics Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">All Clinics ({clinics.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clinic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clinics.map((clinic) => (
                <tr key={clinic.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{clinic.name}</div>
                        <div className="text-sm text-gray-500">{clinic.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{clinic.contactPerson || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{clinic.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {clinic.reportsUsed || 0} / {clinic.reportsAllowed || 10}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(((clinic.reportsUsed || 0) / (clinic.reportsAllowed || 10)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      clinic.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {clinic.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {clinic.subscriptionStatus || 'trial'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(clinic.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => viewClinicDetails(clinic)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal(clinic)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivateClinic(clinic.id)}
                        className={clinic.isActive ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                      >
                        {clinic.isActive ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteClinic(clinic.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {clinics.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No clinics registered yet</p>
              <button
                onClick={() => openModal()}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Add First Clinic
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ClinicModal
          clinic={selectedClinic}
          onSubmit={selectedClinic ? handleEditClinic : handleCreateClinic}
          onClose={closeModal}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
        />
      )}
    </div>
  );
};

// Clinic Modal Component
const ClinicModal = ({ clinic, onSubmit, onClose, register, handleSubmit, errors }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {clinic ? 'Edit Clinic' : 'Add New Clinic'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clinic Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Clinic name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              {...register('contactPerson')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              {...register('address')}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700"
            >
              {clinic ? 'Update' : 'Create'} Clinic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Clinic Details Component
const ClinicDetails = ({ clinic, onBack }) => {
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [usage, setUsage] = useState({});

  useEffect(() => {
    if (clinic) {
      const clinicPatients = DatabaseService.getPatientsByClinic(clinic.id);
      const clinicReports = DatabaseService.getReportsByClinic(clinic.id);
      const clinicUsage = DatabaseService.getClinicUsage(clinic.id);
      
      setPatients(clinicPatients);
      setReports(clinicReports);
      setUsage(clinicUsage);
    }
  }, [clinic]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-800 font-medium"
        >
          ← Back to Clinics
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{clinic.name}</h2>
              <p className="text-gray-600">{clinic.email}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            clinic.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {clinic.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{clinic.email}</span>
              </div>
              {clinic.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{clinic.phone}</span>
                </div>
              )}
              {clinic.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">{clinic.address}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Joined {new Date(clinic.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Usage Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reports Used:</span>
                <span className="font-semibold">{clinic.reportsUsed || 0} / {clinic.reportsAllowed || 10}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Patients:</span>
                <span className="font-semibold">{patients.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Reports:</span>
                <span className="font-semibold">{reports.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subscription:</span>
                <span className="font-semibold capitalize">{clinic.subscriptionStatus || 'Trial'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm">
                View All Patients
              </button>
              <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm">
                View All Reports
              </button>
              <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm">
                Manage Subscription
              </button>
              <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm">
                Send Notification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicManagement;