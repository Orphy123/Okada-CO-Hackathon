import React, { useState } from 'react';
import { Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offsetTop = section.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'chat', label: 'Chat' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'documents', label: 'Documents' },
    { id: 'insights', label: 'Insights' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 transition-all">
      <div className="container">
        <div className="flex items-center justify-between h-18">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">AI CRE Assistant</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`relative py-2 font-medium transition-colors ${
                  activeSection === link.id
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Hello, {user.name}
                </span>
                <button
                  onClick={logout}
                  className="btn btn-outline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button className="btn btn-outline">
                  Login
                </button>
                <button className="btn btn-primary">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;