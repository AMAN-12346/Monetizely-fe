'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { quoteApi } from '@/api/quoteApi';
import type { Quote } from '@/types';

const TERM_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  annual: 'Annual',
  'two-year': 'Two-year',
};

export default function QuotesListPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    quoteApi
      .getAll()
      .then(setQuotes)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page">
      <div className="flex items-center justify-between mb-32">
        <div>
          <h1 className="page-title">All Quotes</h1>
          <p className="page-subtitle">View and share quotes created for customers</p>
        </div>
        <Link href="/quotes/new" className="btn btn-primary">+ New Quote</Link>
      </div>

      {error && <div className="alert alert-error mb-24">{error}</div>}

      {loading ? (
        <div className="loading-screen"><span className="spinner" /> Loading quotes…</div>
      ) : quotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">No quotes yet</div>
          <div className="empty-state__desc">Create your first quote to get started</div>
          <Link href="/quotes/new" className="btn btn-primary">+ New Quote</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Quote Name</th>
                <th>Customer</th>
                <th>Product / Tier</th>
                <th>Term</th>
                <th className="text-right">Total</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q._id} className="table-row-hover">
                  <td style={{ width: '120px' }}>
                    <span className="badge badge-primary">{q.quoteId}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{q.quoteName}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{q.customerName}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--color-text)' }}>{q.productName}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                      Tier: {q.tierName}
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{TERM_LABELS[q.termLength]}</td>
                  <td className="text-right font-mono" style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    ${q.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ width: '80px', textAlign: 'right' }}>
                    <Link href={`/quotes/${q.quoteId}`} className="btn btn-ghost btn-sm">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
