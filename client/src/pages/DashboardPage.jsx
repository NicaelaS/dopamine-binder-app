export default function DashboardPage({ user }) {
  return (
    <main className="page dashboard-page">
      <div className="dashboard-card">
        <p className="eyebrow">Dashboard</p>
        <h1>Welcome back, {user?.name || 'friend'}!</h1>

        <div className="profile-box">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="avatar" />
          ) : null}

          <div>
            <p>
              <strong>Name:</strong> {user?.name}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
          </div>
        </div>

        <p className="dashboard-copy">
          Your session is active and the app is loading the authenticated user from the
          backend profile route using the Express session cookie.
        </p>
      </div>
    </main>
  );
}
