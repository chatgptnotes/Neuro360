import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, UploadCloud, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';
import { useAuth } from '../../contexts/AuthContext';

const UploadReportModal = ({ clinicId, patient, onUpload, onClose }) => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [isUploading, setIsUploading] = useState(false);
  const selectedFile = watch('reportFile');

  const onSubmit = async (data) => {
    setIsUploading(true);
    try {
      const reportData = {
        clinicId,
        patientId: patient.id,
        title: data.title,
        notes: data.notes,
        fileName: data.reportFile[0].name,
        fileType: data.reportFile[0].type,
        fileSize: `${(data.reportFile[0].size / 1024).toFixed(2)} KB`,
        uploadedBy: user.name,
      };

      DatabaseService.addReport(reportData);
      toast.success('Report uploaded successfully');
      onUpload();
      onClose();
    } catch (error) {
      toast.error('Failed to upload report');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload New Report for {patient.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
              Patient
            </label>
            <input
              id="patientName"
              type="text"
              disabled
              value={patient.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Report Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: 'Title is required' })}
              className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="reportFile" className="block text-sm font-medium text-gray-700 mb-2">
              Report File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="reportFile"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input id="reportFile" {...register('reportFile', { required: 'File is required' })} type="file" accept=".pdf,.docx,.edf,.csv,.txt,.jpg,.jpeg,.png" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, EDF, DOCX, images, etc. up to 10MB</p>
              </div>
            </div>
            {selectedFile && selectedFile[0] && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                {selectedFile[0].name}
              </div>
            )}
            {errors.reportFile && <p className="text-red-500 text-sm mt-1">{errors.reportFile.message}</p>}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Upload Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadReportModal;