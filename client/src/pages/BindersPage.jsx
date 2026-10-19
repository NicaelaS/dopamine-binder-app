import Sidebar from '../components/Sidebar';

export default function BindersPage() {
  return (
    <div className="background-page" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar activePath="/BindersPage" />

      <main style={{ flex: 1, padding: '32px 40px' }}>
        <div className="dashboard-card" style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="eyebrow">Binders</p>
          <h1>Your collection</h1>

          <div className="profile-box">
            <div>
              <p><strong>Books:</strong> 0</p>
              <p><strong>Cards:</strong> 0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
