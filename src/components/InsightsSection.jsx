import React from 'react';
import { PieChart, TrendingUp, Star, Bot, MessageCircle, Search, Upload } from 'lucide-react';

const InsightsSection = () => {
  const insights = [
    {
      title: 'Portfolio Overview',
      icon: PieChart,
      content: (
        <div>
          <div className="text-center mb-5">
            <div className="text-4xl font-bold text-primary-600">$2.5B</div>
            <div className="text-sm text-gray-500">Total Portfolio Value</div>
          </div>
          <div className="flex gap-6">
            <div className="text-center flex-1">
              <div className="text-xl font-bold text-gray-900">225</div>
              <div className="text-xs text-gray-500">Properties</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-xl font-bold text-gray-900">3.2M</div>
              <div className="text-xs text-gray-500">Total SF</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Market Trends',
      icon: TrendingUp,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Avg Rent/SF</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">$94.23</span>
              <span className="text-sm text-green-500 font-medium">+2.1%</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Occupancy Rate</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">92.5%</span>
              <span className="text-sm text-green-500 font-medium">+1.8%</span>
            </div>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-sm text-gray-600">Cap Rate</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">6.2%</span>
              <span className="text-sm text-red-500 font-medium">-0.3%</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Top Opportunities',
      icon: Star,
      content: (
        <div className="space-y-3">
          {[
            { address: '1412 Broadway', details: '19,712 SF • $107/SF', score: '9.2' },
            { address: '345 Seventh Ave', details: '18,591 SF • $100/SF', score: '8.9' },
            { address: '9 Times Square', details: '18,890 SF • $94/SF', score: '8.7' }
          ].map((opportunity, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <div className="font-semibold text-gray-900">{opportunity.address}</div>
                <div className="text-sm text-gray-500">{opportunity.details}</div>
              </div>
              <div className="bg-primary-600 text-white px-2 py-1 rounded text-sm font-semibold">
                {opportunity.score}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'AI Activity',
      icon: Bot,
      content: (
        <div className="space-y-3">
          {[
            { icon: MessageCircle, title: '156 Conversations', subtitle: 'This week' },
            { icon: Search, title: '89 Portfolio Queries', subtitle: 'This week' },
            { icon: Upload, title: '23 Documents Processed', subtitle: 'This week' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
              <activity.icon className="w-5 h-5 text-primary-600" />
              <div>
                <div className="font-semibold text-gray-900">{activity.title}</div>
                <div className="text-sm text-gray-500">{activity.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <section id="insights" className="py-20 bg-white">
      <div className="container">
        <div className="section-header">
          <h2>Market Insights</h2>
          <p>Real-time analytics and trends from your portfolio data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                <insight.icon className="w-5 h-5 text-primary-600" />
              </div>
              {insight.content}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsightsSection;