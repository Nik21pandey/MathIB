import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProtectedRoute, PublicOnlyRoute } from './guards/RouteGuards';
import { CatalogProvider } from './learn/catalog';
import { WorksheetProvider } from './contexts/WorksheetContext';
import WorksheetTray from './components/learn/WorksheetTray';

// Lazy load all pages for optimal bundle splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const PastPapers = lazy(() => import('./pages/PastPapers'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Profile = lazy(() => import('./pages/Profile'));
const Bundles = lazy(() => import('./pages/Bundles'));
const BundleDetail = lazy(() => import('./pages/BundleDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const MyPurchases = lazy(() => import('./pages/MyPurchases'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const QuestionDetail = lazy(() => import('./components/QuestionDetail'));
const PaperDetail = lazy(() => import('./components/PaperDetail'));

// Learn platform pages
const Contents = lazy(() => import('./pages/learn/Contents'));
const Learn = lazy(() => import('./pages/learn/Learn'));
const SyllabusPage = lazy(() => import('./pages/learn/SyllabusPage'));
const TopicWorkspace = lazy(() => import('./pages/learn/TopicWorkspace'));
const QuestionPage = lazy(() => import('./pages/learn/QuestionPage'));
const WorksheetSolutions = lazy(() =>
  import('./pages/learn/QuestionPage').then((m) => ({ default: m.WorksheetSolutions }))
);
const WorksheetBuilder = lazy(() => import('./pages/learn/WorksheetBuilder'));
const WorksheetPrint = lazy(() => import('./pages/learn/WorksheetPrint'));
const DailyFive = lazy(() => import('./pages/learn/Practice'));
const QuizPage = lazy(() =>
  import('./pages/learn/Practice').then((m) => ({ default: m.QuizPage }))
);
const Crash = lazy(() => import('./pages/learn/Crash'));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Hide navbar and sidebar on auth pages and onboarding
  const isAuthPage =
    location.pathname === '/login/' ||
    location.pathname === '/register/' ||
    location.pathname === '/onboarding';

  // The printable worksheet is a bare page: no navbar, no sidebar.
  const isPrintPage = location.pathname.startsWith('/worksheet/print');

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
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
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
              <Route path="/practice" element={<DailyFive />} />
              <Route path="/practice/mcq" element={<Contents />} />
              <Route path="/practice/question-bank" element={<Contents />} />
              <Route path="/quiz/:spec" element={<QuizPage />} />
              <Route path="/question/:slug" element={<QuestionPage />} />
              <Route path="/worksheet-builder" element={<WorksheetBuilder />} />
              <Route path="/exam-builder" element={<WorksheetBuilder />} />
              <Route path="/worksheet/print" element={<WorksheetPrint />} />
              <Route path="/w/:code" element={<WorksheetSolutions />} />
              <Route path="/crash" element={<Crash />} />
              <Route path="/crash/:slug" element={<Crash />} />

              {/* Catalog & Past Papers: public browsing */}
              <Route path="/papers" element={<PastPapers />} />
              <Route path="/past-papers" element={<PastPapers />} />
              <Route path="/papers/:id" element={<PaperDetail />} />
              <Route path="/bundles" element={<Bundles />} />
              <Route path="/bundles/:id" element={<BundleDetail />} />
              <Route path="/questions/:id" element={<QuestionDetail />} />

              {/* Protected User Account & E-commerce Routes */}
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

              {/* Syllabus-matched URLs */}
              <Route path="/:syllabus" element={<SyllabusPage />} />
              <Route path="/:syllabus/:section" element={<SyllabusPage />} />
              <Route path="/:syllabus/:section/:topic" element={<TopicWorkspace />} />
            </Routes>
          </Suspense>
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
