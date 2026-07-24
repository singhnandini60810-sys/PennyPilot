function DashboardPage() {
  return (
    <main className="page-content">
      <header className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title">Dashboard</h1>

          <p className="page-header__description">
            Track your spending, understand your habits, and manage your money
            with PennyPilot.
          </p>
        </div>
      </header>

      <section className="card" style={{ padding: '32px' }}>
        <h2>PennyPilot is ready</h2>

        <p style={{ marginTop: '10px' }}>
          Your real expense dashboard will appear here after the components are
          connected.
        </p>
      </section>
    </main>
  )
}

export default DashboardPage