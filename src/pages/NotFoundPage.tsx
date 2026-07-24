import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="page-content">
      <section
        className="card"
        style={{
          maxWidth: '560px',
          margin: '80px auto',
          padding: '48px',
          textAlign: 'center',
        }}
      >
        <h1>Page not found</h1>

        <p style={{ margin: '16px 0 28px' }}>
          The page you are looking for does not exist.
        </p>

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            padding: '12px 20px',
            background: 'var(--color-marigold)',
            color: 'var(--color-police-blue-dark)',
            borderRadius: 'var(--radius-round)',
            fontWeight: 700,
          }}
        >
          Return to dashboard
        </Link>
      </section>
    </main>
  )
}

export default NotFoundPage