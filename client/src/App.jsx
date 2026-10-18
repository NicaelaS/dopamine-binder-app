import './App.css';
import { useAuth } from './context/AuthContext';
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <DashboardPage user={user} /> : <WelcomePage />;
}

export default App;