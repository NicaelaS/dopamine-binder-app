import Sidebar from '../components/Sidebar';
import AddItemForm from '../components/AddItemForm';

export default function ItemsPage() {
  return (
    <div className="background-page" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar activePath="/ItemsPage" />

      <main style={{ flex: 1, padding: '32px 40px' }}>
        <div className="dashboard-card" style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="eyebrow">Items</p>
          <h1>Your items</h1>

          <div className="profile-box" style={{ marginBottom: '24px' }}>
            <div>
              <p><strong>Books:</strong> 0</p>
              <p><strong>Cards:</strong> 0</p>
            </div>
          </div>

          <AddItemForm binderId="" />
        </div>
      </main>
    </div>
  );
}
