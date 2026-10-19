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
          element={user ? <Navigate to="/DashboardPage" replace /> : <WelcomePage />}
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
          path="/BindersPage"
          element={
            <ProtectedRoute>
              <BindersPage />
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

        <Route path="*" element={<Navigate to={user ? '/DashboardPage' : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;