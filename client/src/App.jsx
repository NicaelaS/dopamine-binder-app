import './App.css';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import WelcomePage from './pages/WelcomePage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="page loading-page">
        <div className="loading-card">Loading your session...</div>
      </main>
    );
  }

  return user ? <DashboardPage user={user} /> : <WelcomePage />;
}

export default App;