import React, { useState, useRef } from 'react';
import { Upload, FileText, Database, Search, Brain, ArrowUp, CheckCircle } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { chatAPI } from '../services/api';

const DocumentsSection = () => {
  const { addNotification } = useNotification();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalChunks: 0,
    indexStatus: 'Ready',
    aiAccuracy: '99.9%'
  });
  const fileInputRef = useRef(null);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const response = await chatAPI.uploadDocuments(Array.from(files));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1500);

      addNotification(
        `Successfully uploaded ${response.files_processed} files and added ${response.chunks_added} text chunks to the knowledge base.`,
        'success'
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        totalDocs: prev.totalDocs + response.files_processed,
        totalChunks: prev.totalChunks + response.chunks_added
      }));

    } catch (error) {
      clearInterval(progressInterval);
      setUploading(false);
      setUploadProgress(0);
      addNotification('Upload failed. Please check your files and try again.', 'error');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    handleFileUpload(e.target.files);
    e.target.value = ''; // Reset input
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const statCards = [
    {
      icon: FileText,
      value: stats.totalDocs,
      label: 'Documents',
      trend: '+12 this week',
      trendIcon: ArrowUp,
      trendColor: 'text-green-500'
    },
    {
      icon: Database,
      value: stats.totalChunks.toLocaleString(),
      label: 'Text Chunks',
      trend: '+156 this week',
      trendIcon: ArrowUp,
      trendColor: 'text-green-500'
    },
    {
      icon: Search,
      value: stats.indexStatus,
      label: 'Index Status',
      trend: 'Optimized',
      trendIcon: CheckCircle,
      trendColor: 'text-green-500'
    },
    {
      icon: Brain,
      value: stats.aiAccuracy,
      label: 'AI Accuracy',
      trend: '+0.2% this month',
      trendIcon: ArrowUp,
      trendColor: 'text-green-500'
    }
  ];

  return (
    <section id="documents" className="py-20 bg-gray-50">
      <div className="container">
        <div className="section-header">
          <h2>Document Intelligence</h2>
          <p>Upload and manage your real estate documents to enhance AI insights</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Upload Panel */}
          <div className="mb-8">
            {!uploading ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-16 text-center bg-white transition-all cursor-pointer ${
                  dragOver
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-600 hover:bg-gray-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFileDialog}
              >
                <div className="mb-5">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-700">Upload Documents</h3>
                <p className="text-gray-500 mb-2">Drag and drop files here or click to browse</p>
                <p className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-6">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" /> PDF
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" /> CSV
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" /> JSON
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" /> TXT
                  </span>
                </p>
                <button className="btn btn-primary">
                  <Upload className="w-4 h-4" />
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.csv,.json,.txt"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Processing Documents</h4>
                  <span className="text-sm font-medium text-gray-600">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-secondary-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {uploadProgress < 30 ? 'Uploading files...' :
                   uploadProgress < 60 ? 'Extracting text content...' :
                   uploadProgress < 90 ? 'Processing and indexing...' :
                   'Upload complete!'}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className={`flex items-center gap-1 text-xs mt-1 ${stat.trendColor}`}>
                    <stat.trendIcon className="w-3 h-3" />
                    <span>{stat.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocumentsSection;