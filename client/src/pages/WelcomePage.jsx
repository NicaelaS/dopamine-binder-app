import './WelcomePage.css';
import { useAuth } from '../context/AuthContext';

function WelcomePage() {
  const { loginWithGoogle } = useAuth();

  return (
    <main className="background-page welcome-page">
      <div className="welcome-card">

        <h1 className="welcome-title">Dopamine Binder</h1>

        <p className="welcome-tagline">
          Keep track of all your book and card collections in one place
        </p>

        <div className="welcome-panel">
          <p className="welcome-copy">Create an account or sign in with</p>

          <button type="button" className="google-button" onClick={loginWithGoogle}>
            <span className="google-button__icon">G</span>
            Google
          </button>

          <p className="welcome-legal">
            By clicking continue, you agree to our{' '}
            <a href="/terms" className="legal-link">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy" className="legal-link">Privacy Policy</a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default WelcomePage;
