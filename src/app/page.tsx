import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container page">
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 0 80px' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: 16 }}>
          Quoting Tool
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: 480, margin: '0 auto 40px' }}>
          Set up your product catalog and generate accurate, shareable quotes.
        </p>
        <div className="flex items-center gap-16" style={{ justifyContent: 'center' }}>
          <Link href="/quotes/new" className="btn btn-primary btn-lg">New Quote</Link>
          <Link href="/catalog" className="btn btn-secondary btn-lg">View Catalog</Link>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Link href="/catalog" className="card card--clickable" style={{ display: 'block' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 6 }}>Product Catalog</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Manage products, tiers, features, and add-on pricing.</p>
        </Link>
        <Link href="/quotes" className="card card--clickable" style={{ display: 'block' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 6 }}>All Quotes</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>View and share previously created quotes.</p>
        </Link>
      </div>
    </div>
  );
}
