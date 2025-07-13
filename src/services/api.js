import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat API
export const chatAPI = {
  sendMessage: async (userId, message) => {
    const response = await api.post('/chat/', {
      user_id: userId,
      message,
    });
    return response.data;
  },

  uploadDocuments: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post('/chat/upload_docs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  addDocuments: async (documents) => {
    const response = await api.post('/chat/add-documents', { documents });
    return response.data;
  },
};

// Portfolio Analysis API
export const portfolioAPI = {
  analyzePortfolio: async (userId, query, options = {}) => {
    const response = await api.post('/analyze/analyze_portfolio', {
      user_id: userId,
      query,
      return_chart: options.generateChart || false,
      download_csv: options.downloadCsv || false,
    });
    return response.data;
  },

  getPortfolioStats: async () => {
    const response = await api.get('/analyze/portfolio_stats');
    return response.data;
  },
};

// CRM API
export const crmAPI = {
  createUser: async (userData) => {
    const response = await api.post('/crm/create_user', userData);
    return response.data;
  },

  getConversations: async (userId) => {
    const response = await api.get(`/crm/conversations/${userId}`);
    return response.data;
  },

  tagMessage: async (messageId, tag) => {
    const response = await api.put('/crm/tag_message', {
      message_id: messageId,
      tag,
    });
    return response.data;
  },
};

export default api;