import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Database, Search, Brain, ArrowUp, CheckCircle, Trash2, Eye, Calendar, HardDrive, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { chatAPI } from '../services/api';

const DocumentsSection = () => {
  const { addNotification } = useNotification();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'manage'
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalChunks: 0,
    indexStatus: 'Ready',
    aiAccuracy: '99.9%'
  });
  const fileInputRef = useRef(null);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await chatAPI.getDocuments();
      setDocuments(response.documents || []);
      
      // Update stats based on loaded documents
      const totalDocs = response.documents?.length || 0;
      const totalChunks = response.documents?.reduce((sum, doc) => sum + doc.chunk_count, 0) || 0;
      
      setStats(prev => ({
        ...prev,
        totalDocs,
        totalChunks
      }));
    } catch (error) {
      console.error('Error loading documents:', error);
      addNotification('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

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

      // Reload documents to update the list
      loadDocuments();

    } catch (error) {
      clearInterval(progressInterval);
      setUploading(false);
      setUploadProgress(0);
      addNotification('Upload failed. Please check your files and try again.', 'error');
    }
  };

  const handleDeleteDocument = async (documentId, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await chatAPI.deleteDocument(documentId);
      addNotification(`Successfully deleted "${filename}"`, 'success');
      loadDocuments(); // Reload the list
    } catch (error) {
      addNotification(`Failed to delete "${filename}"`, 'error');
    }
  };

  const handleClearAllDocuments = async () => {
    if (!window.confirm('Are you sure you want to delete ALL documents? This action cannot be undone.')) {
      return;
    }

    try {
      await chatAPI.clearAllDocuments();
      addNotification('Successfully cleared all documents', 'success');
      loadDocuments(); // Reload the list
    } catch (error) {
      addNotification('Failed to clear documents', 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
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
      trend: documents.length > 0 ? `${documents.length} files` : 'No files',
      trendIcon: documents.length > 0 ? CheckCircle : AlertTriangle,
      trendColor: documents.length > 0 ? 'text-green-500' : 'text-gray-400'
    },
    {
      icon: Database,
      value: stats.totalChunks.toLocaleString(),
      label: 'Text Chunks',
      trend: `${stats.totalChunks} processed`,
      trendIcon: Database,
      trendColor: 'text-blue-500'
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
      trend: 'Ready for queries',
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
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-white p-1 rounded-lg border">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Documents
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'manage'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Manage Documents ({documents.length})
              </button>
            </div>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
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
          )}

          {/* Manage Documents Tab */}
          {activeTab === 'manage' && (
            <div className="mb-8">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Document Library</h3>
                    <p className="text-gray-500 text-sm">Manage your uploaded documents</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={loadDocuments}
                      disabled={loading}
                      className="btn btn-secondary"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                    {documents.length > 0 && (
                      <button
                        onClick={handleClearAllDocuments}
                        className="btn bg-red-600 text-white hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Loading documents...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h4>
                    <p className="text-gray-500 mb-4">Upload your first document to get started</p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="btn btn-primary"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Documents
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {doc.filename}
                              </h4>
                              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(doc.upload_date)}
                                </span>
                                <span className="flex items-center">
                                  <HardDrive className="w-3 h-3 mr-1" />
                                  {formatFileSize(doc.file_size)}
                                </span>
                                <span className="flex items-center">
                                  <Database className="w-3 h-3 mr-1" />
                                  {doc.chunk_count} chunks
                                </span>
                              </div>
                              <div className="mt-2">
                                <div className="text-xs text-gray-400">
                                  Text Length: {doc.total_text_length?.toLocaleString()} characters
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

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