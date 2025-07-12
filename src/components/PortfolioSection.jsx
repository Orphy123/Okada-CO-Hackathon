import React, { useState, useEffect } from 'react';
import { Search, BarChart3, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { portfolioAPI } from '../services/api';

const PortfolioSection = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [query, setQuery] = useState('');
  const [generateChart, setGenerateChart] = useState(false);
  const [downloadCsv, setDownloadCsv] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [portfolioStats, setPortfolioStats] = useState(null);

  useEffect(() => {
    loadPortfolioStats();
  }, []);

  const loadPortfolioStats = async () => {
    try {
      const stats = await portfolioAPI.getPortfolioStats();
      setPortfolioStats(stats);
    } catch (error) {
      console.error('Failed to load portfolio stats:', error);
    }
  };

  const exampleQueries = [
    'Properties larger than 18,000 square feet',
    'Properties with rent under $85 per square foot',
    'High GCI properties above $300,000',
    'Properties on Broadway or Times Square'
  ];

  const analyzePortfolio = async () => {
    if (!query.trim()) {
      addNotification('Please enter a query to analyze your portfolio', 'warning');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const data = await portfolioAPI.analyzePortfolio(
        user?.id || 'anonymous',
        query,
        { generateChart, downloadCsv }
      );

      setResults(data);
      addNotification(`Analysis complete! Found ${data.total_matches} matching properties.`, 'success');
    } catch (error) {
      addNotification('Portfolio analysis failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      analyzePortfolio();
    }
  };

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    return new Intl.NumberFormat().format(num);
  };

  return (
    <section id="portfolio" className="py-20 bg-white">
      <div className="container">
        <div className="section-header">
          <h2>Portfolio Analysis</h2>
          <p>Analyze your commercial real estate portfolio with natural language queries</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Query Panel */}
          <div className="bg-gray-50 p-8 rounded-2xl mb-8 border border-gray-200">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Natural Language Query</h3>
              <p className="text-gray-600">Describe what you're looking for in plain English</p>
            </div>

            <div className="mb-6">
              <div className="flex gap-4 items-end">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Show me all properties above 15,000 SF with rent below $90/SF and GCI above $250K over 3 years"
                  className="flex-1 px-5 py-4 border border-gray-300 rounded-lg resize-vertical min-h-20 outline-none transition-colors focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                />
                <button
                  onClick={analyzePortfolio}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  {loading ? 'Analyzing...' : 'Analyze Portfolio'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium mb-4 text-gray-900">Output Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generateChart}
                      onChange={(e) => setGenerateChart(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      Generate Visual Chart
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={downloadCsv}
                      onChange={(e) => setDownloadCsv(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <FileText className="w-4 h-4 text-gray-500" />
                      Export to CSV
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4 text-gray-900">Example Queries</h4>
                <div className="flex flex-col gap-2">
                  {exampleQueries.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(example)}
                      className="text-left px-3 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg text-xs hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white border border-gray-200 rounded-2xl min-h-96 flex items-center justify-center p-8">
            {loading ? (
              <div className="text-center text-gray-500">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin-slow mx-auto mb-5" />
                <h3 className="text-lg font-semibold mb-2">Analyzing Your Portfolio</h3>
                <p>Processing your query and searching through property data...</p>
              </div>
            ) : results ? (
              <div className="w-full text-left">
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold mb-2">Analysis Results</h3>
                  <p>Found <strong>{results.total_matches}</strong> properties matching your criteria</p>
                </div>

                <div className="mb-6">
                  <h4 className="flex items-center gap-2 text-lg font-medium mb-3">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                    Summary
                  </h4>
                  <p className="text-gray-700">{results.summary}</p>
                </div>

                {results.matches && results.matches.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-3">
                      Matching Properties (Top {Math.min(results.matches.length, 10)})
                    </h4>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Property Address</th>
                            <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Suite</th>
                            <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Size (SF)</th>
                            <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Rent/SF/Year</th>
                            <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">GCI (3 Years)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {results.matches.slice(0, 10).map((property, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-3 text-sm font-medium text-gray-900">
                                {property['Property Address'] || 'N/A'}
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-700">
                                {property['Suite'] || 'N/A'}
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-700">
                                {formatNumber(property['Size (SF)'])}
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-700">
                                {property['Rent/SF/Year'] || 'N/A'}
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-700">
                                {property['GCI On 3 Years'] || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(results.chart_url || results.csv_url) && (
                  <div>
                    <h4 className="text-lg font-medium mb-3">Downloads</h4>
                    <div className="flex gap-3">
                      {results.chart_url && (
                        <a
                          href={`http://localhost:8000${results.chart_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                        >
                          <BarChart3 className="w-4 h-4" />
                          View Chart
                        </a>
                      )}
                      {results.csv_url && (
                        <a
                          href={`http://localhost:8000${results.csv_url}`}
                          download
                          className="btn btn-outline"
                        >
                          <FileText className="w-4 h-4" />
                          Download CSV
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                <p className="mb-8">Enter a query above to discover insights about your portfolio</p>
                {portfolioStats && (
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{portfolioStats.total_properties}</div>
                      <div className="text-sm text-gray-500">Properties Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">${portfolioStats.avg_rent_per_sf?.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Avg Rent/SF</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{(portfolioStats.avg_size_sf / 1000)?.toFixed(1)}K</div>
                      <div className="text-sm text-gray-500">Avg Size SF</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;