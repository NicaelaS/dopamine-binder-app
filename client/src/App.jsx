import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import BindersPage from './pages/BindersPage';
import ItemsPage from './pages/ItemsPage';
import WelcomePage from './pages/WelcomePage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <WelcomePage />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/DashboardPage"
          element={
            <ProtectedRoute>
              <DashboardPage user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/binders"
          element={
            <ProtectedRoute>
              <BindersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/BindersPage"
          element={
            <ProtectedRoute>
              <BindersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <ItemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ItemsPage"
          element={
            <ProtectedRoute>
              <ItemsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;