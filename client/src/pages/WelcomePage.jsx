import { useAuth } from '../context/AuthContext';

export default function WelcomePage() {
  const { loginWithGoogle } = useAuth();

  return (
    <main className="page welcome-page">
      <div className="welcome-card">
        <p className="eyebrow">Dopamine Binder</p>
        <h1>Welcome</h1>
        <p className="subtext">
          Sign in with Google to manage your collection, track favorites, and keep your
          inventory organized.
        </p>

        <button type="button" className="google-button" onClick={loginWithGoogle}>
          Continue with Google
        </button>
      </div>
    </main>
  );
}
