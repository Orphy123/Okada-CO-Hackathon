import React, { useState, useEffect } from 'react';
import { Building, Menu, X, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import orphyAILogo from '../assets/orphyAI.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPos = window.scrollY + 100;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offsetTop = section.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home', icon: '⚡' },
    { id: 'chat', label: 'AI Chat', icon: '🤖' },
    { id: 'portfolio', label: 'Portfolio', icon: '🎯' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'insights', label: 'Insights', icon: '🧠' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="container">
          <div className="flex items-center justify-between h-20">
            {/* Brand */}
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => scrollToSection('home')}>
              <div className="relative">
                <img 
                  src={orphyAILogo} 
                  alt="ORPHY AI Logo" 
                  className="w-10 h-10 rounded-xl transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl object-contain"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse-slow opacity-80" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  ORPHY AI
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-100/80 backdrop-blur-sm rounded-full p-1 border border-gray-200/50">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`relative px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeSection === link.id
                      ? 'bg-white text-primary-600 shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-white/50'
                  }`}
                >
                  <span className="text-sm">{link.icon}</span>
                  <span className="text-sm">{link.label}</span>
                  {activeSection === link.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-secondary-600/10 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-2 rounded-full border border-primary-200/50">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-gray-500 text-xs">{user.company || 'Individual'}</div>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="btn btn-outline group relative overflow-hidden"
                  >
                    <span className="relative z-10">Logout</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <button className="btn btn-outline group relative overflow-hidden" data-auth-action="login">
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  </button>
                  <button className="btn btn-primary group relative overflow-hidden" data-auth-action="signup">
                    <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform relative z-10" />
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary-600 to-accent-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-300" />
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
        isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-white shadow-2xl transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={orphyAILogo} 
                  alt="ORPHY AI Logo" 
                  className="w-10 h-10 rounded-xl object-contain"
                />
                <div>
                  <div className="font-bold text-gray-900">ORPHY AI</div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeSection === link.id
                    ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-600 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
                {activeSection === link.id && (
                  <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {!user && (
            <div className="p-6 border-t border-gray-200 space-y-3">
              <button className="btn btn-outline btn-full" data-auth-action="login">
                Login
              </button>
              <button className="btn btn-primary btn-full" data-auth-action="signup">
                <Zap className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Get Started</span>
              </button>
            </div>
          )}

          {user && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.company || 'ORPHY User'}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="btn btn-outline btn-full"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;