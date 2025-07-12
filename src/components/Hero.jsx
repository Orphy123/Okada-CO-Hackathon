import React from 'react';
import { MessageCircle, TrendingUp, Sparkles, Bot, User } from 'lucide-react';

const Hero = () => {
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offsetTop = section.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="pt-20 pb-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='%23e5e7eb' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-primary-600 mb-6 shadow-sm">
              <Zap className="w-4 h-4" />
              AI-Powered Real Estate Intelligence
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900 mt-8">
              Your Digital Co-Pilot for{' '}
              <span className="gradient-text">Commercial Real Estate</span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Transform complex property searches into simple conversations. Analyze portfolios, 
              discover opportunities, and make data-driven decisions with our advanced AI assistant.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 mb-16">
              <button
                onClick={() => scrollToSection('chat')}
                className="btn btn-primary btn-large"
              >
                <MessageCircle className="w-5 h-5" />
                Start Analyzing
              </button>
              <button
                onClick={() => scrollToSection('portfolio')}
                className="btn btn-outline btn-large"
              >
                <TrendingUp className="w-5 h-5" />
                View Demo
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-10 justify-center sm:justify-start">
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-primary-600">$2.5B+</div>
                <div className="text-sm text-gray-500">Properties Analyzed</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-primary-600">10K+</div>
                <div className="text-sm text-gray-500">Documents Processed</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-primary-600">99.9%</div>
                <div className="text-sm text-gray-500">Accuracy Rate</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="flex justify-center items-center">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-float border border-gray-200">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-gray-900">AI Assistant</span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow" />
              </div>

              <div className="space-y-4 mb-5">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700">
                      I found 12 properties above 15,000 SF with rent below $90/SF. Average GCI is $275K over 3 years.
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-primary-600 text-white rounded-lg p-3 text-sm">
                      Show me properties above 15,000 SF with rent below $90/SF
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-center flex-1">
                  <div className="text-lg font-bold text-primary-600">$85.2</div>
                  <div className="text-xs text-gray-500">Avg Rent/SF</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-lg font-bold text-primary-600">17.5K</div>
                  <div className="text-xs text-gray-500">Avg Size SF</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;