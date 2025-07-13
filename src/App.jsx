import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import ChatSection from './components/ChatSection';
import PortfolioSection from './components/PortfolioSection';
import DocumentsSection from './components/DocumentsSection';
import InsightsSection from './components/InsightsSection';
import Footer from './components/Footer';
import AuthModals from './components/AuthModals';
import NotificationContainer from './components/NotificationContainer';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-white">
            <Navbar />
            <main>
              <Hero />
              <Features />
              <ChatSection />
              <PortfolioSection />
              <DocumentsSection />
              <InsightsSection />
            </main>
            <Footer />
            <AuthModals />
            <NotificationContainer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;