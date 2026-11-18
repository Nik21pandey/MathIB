import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import Home from './pages/Home';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Onboarding from './pages/Onboarding.tsx';
import PastPapers from './pages/PastPapers.tsx';
import Favorites from './pages/Favorites.tsx';
import Profile from './pages/Profile.tsx';
import Bundles from './pages/Bundles.tsx';
import BundleDetail from './pages/BundleDetail.tsx';
import Cart from './pages/Cart.tsx';
import MyPurchases from './pages/MyPurchases.tsx';
import Checkout from './pages/Checkout.tsx';
import OrderConfirmation from './pages/OrderConfirmation.tsx';
import QuestionDetail from './components/QuestionDetail.tsx';
import PaperDetail from './components/PaperDetail.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProtectedRoute, PublicOnlyRoute } from './guards/RouteGuards';
import { CatalogProvider } from './learn/catalog';
import { WorksheetProvider } from './contexts/WorksheetContext';
import WorksheetTray from './components/learn/WorksheetTray';
import Contents from './pages/learn/Contents';
import Learn from './pages/learn/Learn';
import SyllabusPage from './pages/learn/SyllabusPage';
import TopicWorkspace from './pages/learn/TopicWorkspace';
import QuestionPage, { WorksheetSolutions } from './pages/learn/QuestionPage';
import WorksheetBuilder from './pages/learn/WorksheetBuilder';
import WorksheetPrint from './pages/learn/WorksheetPrint';
import DailyFive, { QuizPage } from './pages/learn/Practice';
import Crash from './pages/learn/Crash';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Hide navbar and sidebar on auth pages and onboarding
  const isAuthPage = location.pathname === '/login/' || 
                     location.pathname === '/register/' || 
                     location.pathname === '/onboarding';
  
  // The printable worksheet is a bare page: no navbar, no sidebar.
  const isPrintPage = location.pathname.startsWith('/worksheet/print');

  // Show sidebar on all pages except auth pages and the printable worksheet
  const hideSidebar = isAuthPage || isPrintPage;

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && !isPrintPage && (
        <div className="print:hidden">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>
      )}
      
      <div className="flex">
        {!hideSidebar && (
          <div className="print:hidden">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          </div>
        )}
        
        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login/" 
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              } 
            />
            <Route 
              path="/register/" 
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              } 
            />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            {/* Learning platform: public, no login needed */}
            <Route path="/contents" element={<Contents />} />
            <Route path="/questions" element={<Contents />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/daily-5" element={<DailyFive />} />
            <Route path="/quiz/:spec" element={<QuizPage />} />
            <Route path="/question/:slug" element={<QuestionPage />} />
            <Route path="/worksheet-builder" element={<WorksheetBuilder />} />
            <Route path="/exam-builder" element={<WorksheetBuilder />} />
            <Route path="/worksheet/print" element={<WorksheetPrint />} />
            <Route path="/w/:code" element={<WorksheetSolutions />} />
            <Route path="/crash" element={<Crash />} />
            <Route path="/crash/:slug" element={<Crash />} />
            <Route 
              path="/questions/:id" 
              element={
                <ProtectedRoute>
                  <QuestionDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/papers" 
              element={
                <ProtectedRoute>
                  <PastPapers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/papers/:id" 
              element={
                <ProtectedRoute>
                  <PaperDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bundles" 
              element={
                <ProtectedRoute>
                  <Bundles />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bundles/:id" 
              element={
                <ProtectedRoute>
                  <BundleDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders/:id" 
              element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/purchases" 
              element={
                <ProtectedRoute>
                  <MyPurchases />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/favorites" 
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            {/* Syllabus-matched URLs, e.g. /igcse-0580/non-calculator-paper-2/surds-and-rationalising.
                Keep these last: every fixed route above takes priority over them. */}
            <Route path="/:syllabus" element={<SyllabusPage />} />
            <Route path="/:syllabus/:section" element={<SyllabusPage />} />
            <Route path="/:syllabus/:section/:topic" element={<TopicWorkspace />} />
          </Routes>
        </main>
      </div>
      <WorksheetTray />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CatalogProvider>
          <WorksheetProvider>
            <Router>
              <AppContent />
            </Router>
          </WorksheetProvider>
        </CatalogProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
