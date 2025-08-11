import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Calendar,
  Search,
  Filter,
  X,
  FileText,
  Phone,
  Mail,
  MapPin,
  Upload
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';
import UploadReportModal from './UploadReportModal';

const PatientManagement = ({ clinicId, onUpdate }) => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [patientForUpload, setPatientForUpload] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (clinicId) {
      loadPatients();
    }
  }, [clinicId]);

  const loadPatients = () => {
    try {
      const patientsData = DatabaseService.getPatientsByClinic(clinicId);
      setPatients(patientsData);
    } catch (error) {
      toast.error('Error loading patients');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = (data) => {
    try {
      const patientData = {
        ...data,
        clinicId,
        age: parseInt(data.age)
      };
      
      DatabaseService.add('patients', patientData);
      toast.success('Patient created successfully');
      loadPatients();
      setShowModal(false);
      reset();
      onUpdate?.();
    } catch (error) {
      toast.error('Error creating patient');
      console.error(error);
    }
  };

  const handleEditPatient = (data) => {
    try {
      const patientData = {
        ...data,
        age: parseInt(data.age)
      };
      
      DatabaseService.update('patients', selectedPatient.id, patientData);
      toast.success('Patient updated successfully');
      loadPatients();
      setShowModal(false);
      setSelectedPatient(null);
      reset();
      onUpdate?.();
    } catch (error) {
      toast.error('Error updating patient');
      console.error(error);
    }
  };

  const handleDeletePatient = (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        DatabaseService.delete('patients', patientId);
        toast.success('Patient deleted successfully');
        loadPatients();
        onUpdate?.();
      } catch (error) {
        toast.error('Error deleting patient');
        console.error(error);
      }
    }
  };

  const openModal = (patient = null) => {
    setSelectedPatient(patient);
    if (patient) {
      reset(patient);
    } else {
      reset({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
    reset({});
  };

  const openUploadModal = (patient) => {
    setPatientForUpload(patient);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setPatientForUpload(null);
    setShowUploadModal(false);
  };

  const viewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setViewMode('details');
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone?.includes(searchTerm);
    const matchesGender = !genderFilter || patient.gender === genderFilter;
    
    return matchesSearch && matchesGender;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (viewMode === 'details' && selectedPatient) {
    return <PatientDetails 
      patient={selectedPatient} 
      clinicId={clinicId}
      onBack={() => {setViewMode('list'); setSelectedPatient(null);}} 
    />;
  }

  console.log('Filtered Patients:', filteredPatients);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
          <p className="text-gray-600">Manage your clinic's patient records</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setGenderFilter('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Patients ({filteredPatients.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demographics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EEG Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PDF File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => {
                const patientReports = DatabaseService.getReportsByPatient(patient.id);
                const eegReport = patientReports.find(r => r.fileType && r.fileType.includes('eeg'));
                const pdfReport = patientReports.find(r => r.fileType && r.fileType.includes('pdf'));
                
                return (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">ID: {patient.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{patient.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.age} years</div>
                      <div className="text-sm text-gray-500">{patient.gender}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {eegReport ? (
                        <a href="#" className="text-sm text-primary-600 hover:underline">{eegReport.fileName}</a>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pdfReport ? (
                        <a href="#" className="text-sm text-primary-600 hover:underline">{pdfReport.fileName}</a>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openUploadModal(patient)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Upload Report"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => viewPatientDetails(patient)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal(patient)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Patient"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Patient"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {searchTerm || genderFilter 
                  ? 'No patients match your filters' 
                  : 'No patients added yet'
                }
              </p>
              <button
                onClick={() => openModal()}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Add First Patient
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <PatientModal
          patient={selectedPatient}
          onSubmit={selectedPatient ? handleEditPatient : handleCreatePatient}
          onClose={closeModal}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
        />
      )}

      {/* Upload Report Modal */}
      {showUploadModal && (
        <UploadReportModal
          clinicId={clinicId}
          patient={patientForUpload}
          onUpload={() => {
            loadPatients();
            closeUploadModal();
            onUpdate?.();
          }}
          onClose={closeUploadModal}
        />
      )}
    </div>
  );
};

// Patient Modal Component
const PatientModal = ({ patient, onSubmit, onClose, register, handleSubmit, errors }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {patient ? 'Edit Patient' : 'Add New Patient'}
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
              Full Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Full name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input
                type="number"
                min="0"
                max="120"
                {...register('age', { 
                  required: 'Age is required',
                  min: { value: 0, message: 'Age must be positive' },
                  max: { value: 120, message: 'Age must be realistic' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                {...register('gender', { required: 'Gender is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email', { 
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
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical Notes
            </label>
            <textarea
              {...register('notes')}
              rows="3"
              placeholder="Any relevant medical history or notes..."
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
              {patient ? 'Update' : 'Create'} Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Patient Details Component
const PatientDetails = ({ patient, clinicId, onBack }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (patient) {
      const patientReports = DatabaseService.getReportsByPatient(patient.id);
      setReports(patientReports);
    }
  }, [patient]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-800 font-medium"
        >
          ← Back to Patients
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-gray-600">{patient.age} years • {patient.gender}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-600">Age: </span>
                  <span className="text-sm font-medium text-gray-900">{patient.age} years</span>
                </div>
              </div>
              
              {patient.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{patient.email}</span>
                </div>
              )}
              
              {patient.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{patient.phone}</span>
                </div>
              )}
              
              {patient.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">{patient.address}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Added {new Date(patient.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {patient.notes && (
              <div className="pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Medical Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{patient.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Reports ({reports.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reports.length > 0 ? (
                reports.map(report => (
                  <div key={report.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {report.fileName || 'EEG Report'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-800">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reports for this patient</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;