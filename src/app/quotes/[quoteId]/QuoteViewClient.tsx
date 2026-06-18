'use client';

import { useState } from 'react';
import type { Quote } from '@/types';
import Link from 'next/link';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const TERM_LABELS: Record<string, string> = {
  monthly: 'Monthly (1 month)',
  annual: 'Annual (12 months, 15% discount applies to per-seat price)',
  'two-year': 'Two-year (24 months, 25% discount applies to per-seat price)',
};

export function QuoteViewClient({ quote }: { quote: Quote }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="container page">
      <div className="mb-24 flex justify-between items-center">
        <Link href="/quotes" className="btn btn-ghost">Back to Quotes</Link>
        <button className="btn btn-secondary" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy Share Link'}
        </button>
      </div>
      <div className="quote-view">
        {/* Header */}
        <div className="quote-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--color-primary)', marginBottom: 8, textTransform: 'uppercase',
              }}>
                Pricing Proposal
              </div>
              <h1 className="quote-header__title">{quote.quoteName}</h1>
              <p className="quote-header__subtitle">Prepared for {quote.customerName}</p>
            </div>
          </div>
          <div style={{
            display: 'flex', gap: 24, marginTop: 24,
            color: 'var(--color-text-secondary)', fontSize: '0.85rem',
          }}>
            <span>Date: {new Date(quote.quoteDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>Valid until: {new Date(quote.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{quote.quoteId}</span>
          </div>
        </div>

        {/* Body */}
        <div className="quote-body">
          {/* Quote Details */}
          <div className="quote-section">
            <div className="quote-section__title">Quote details</div>
            <div className="quote-meta-grid">
              <div className="quote-meta-row">
                <span className="key">Customer:</span>
                <span className="val">{quote.customerName}</span>
              </div>
              <div className="quote-meta-row">
                <span className="key">Quote name:</span>
                <span className="val">{quote.quoteName}</span>
              </div>
              <div className="quote-meta-row">
                <span className="key">Quote date:</span>
                <span className="val">{new Date(quote.quoteDate).toLocaleDateString()}</span>
              </div>
              <div className="quote-meta-row">
                <span className="key">Valid until:</span>
                <span className="val">{new Date(quote.validUntil).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* What is being purchased */}
          <div className="quote-section">
            <div className="quote-section__title">What Is Being Purchased</div>
            <div className="quote-meta-grid">
              <div className="quote-meta-row">
                <span className="key">Product</span>
                <span className="val">{quote.productName}</span>
              </div>
              <div className="quote-meta-row">
                <span className="key">Tier</span>
                <span className="val">{quote.tierName}</span>
              </div>
              <div className="quote-meta-row">
                <span className="key">Seats</span>
                <span className="val">{quote.seats}</span>
              </div>
              <div className="quote-meta-row">
                <span className="key">Term length</span>
                <span className="val">{TERM_LABELS[quote.termLength]}</span>
              </div>
              {quote.selectedAddons.length > 0 && (
                <div className="quote-meta-row">
                  <span className="key">Add-ons</span>
                  <span className="val">{quote.selectedAddons.map((a) => a.featureName).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="quote-section">
            <div className="quote-section__title">Cost Breakdown</div>
            <div className="table-wrapper">
              <table className="quote-line-items">
                <thead>
                  <tr>
                    <th>Line Item</th>
                    <th>How It Was Calculated</th>
                    <th>Notes</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lineItems.map((li, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{li.label}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{li.calculation}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{li.notes}</td>
                      <td style={{ textAlign: 'right' }} className="font-mono quote-amount">{fmt(li.amount)}</td>
                    </tr>
                  ))}

                  {/* Subtotal */}
                  <tr style={{ borderTop: '2px solid var(--color-border)' }}>
                    <td colSpan={3} style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Subtotal</td>
                    <td style={{ textAlign: 'right' }} className="font-mono">{fmt(quote.subtotal)}</td>
                  </tr>

                  {/* Discount if any */}
                  {quote.overallDiscountPercent > 0 && (
                    <tr>
                      <td colSpan={3} style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                        Overall Discount ({quote.overallDiscountPercent}%)
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-danger)' }} className="font-mono">
                        −{fmt(quote.discountAmount)}
                      </td>
                    </tr>
                  )}

                  {/* Total */}
                  <tr className="quote-total-row">
                    <td colSpan={3}>TOTAL</td>
                    <td style={{ textAlign: 'right', fontSize: '1.2rem' }} className="font-mono">{fmt(quote.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 32, padding: 20, background: 'var(--color-surface-2)',
            borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--color-text-muted)',
          }}>
            <p>This quote is valid for 30 days from the quote date. All prices are in USD. No taxes included.</p>
            <p style={{ marginTop: 8 }}>
              Term discounts apply to the base per-seat price only. Fixed monthly and per-seat add-ons are billed at the full rate regardless of term length.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
