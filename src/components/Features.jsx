import React from 'react';
import { MessageCircle, Search, Upload, Users } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Natural Language Chat',
      description: 'Ask questions in plain English and get intelligent responses powered by advanced RAG technology.',
      features: [
        'Context-aware conversations',
        'Document-based insights',
        'Multi-turn dialogue support',
        'Conversation history tracking'
      ]
    },
    {
      icon: Search,
      title: 'Portfolio Analysis',
      description: 'Query your real estate portfolio using natural language and get detailed market insights.',
      features: [
        'Smart property filtering',
        'Investment opportunity scoring',
        'Market trend analysis',
        'Visual reports & charts'
      ]
    },
    {
      icon: Upload,
      title: 'Document Intelligence',
      description: 'Upload property documents and let AI extract insights to enhance your knowledge base.',
      features: [
        'PDF, CSV, JSON, TXT support',
        'Automatic data extraction',
        'Semantic search capabilities',
        'Knowledge base enrichment'
      ]
    },
    {
      icon: Users,
      title: 'CRM Integration',
      description: 'Track client interactions, tag conversations, and manage relationships seamlessly.',
      features: [
        'Client conversation tracking',
        'Intent classification',
        'Follow-up automation',
        'Performance analytics'
      ]
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container">
        <div className="section-header">
          <h2>Intelligent Real Estate Analysis</h2>
          <p>Everything you need to make informed commercial real estate decisions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary-600 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-secondary-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 mb-5">{feature.description}</p>

              <ul className="text-left space-y-2">
                {feature.features.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;