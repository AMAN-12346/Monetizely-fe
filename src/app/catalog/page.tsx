'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productApi } from '@/api/productApi';
import type { Product } from '@/types';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    productApi
      .getAll()
      .then(setProducts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const product = await productApi.create(newName.trim());
      setProducts((prev) => [product, ...prev]);
      setNewName('');
      setShowForm(false);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container page">
      <div className="flex items-center justify-between mb-32">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">Define products, tiers, features, and pricing</p>
        </div>
        <button id="new-product-btn" className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          + New Product
        </button>
      </div>

      {showForm && (
        <div className="card mb-32" style={{ borderColor: 'var(--color-primary)', boxShadow: 'var(--shadow-primary)' }}>
          <h3 className="section-title">Create Product</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group mb-16">
              <label htmlFor="product-name">Product Name</label>
              <input
                id="product-name"
                type="text"
                placeholder="e.g. Analytics Suite"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            {error && <div className="alert alert-error mb-16">{error}</div>}
            <div className="flex gap-8">
              <button id="create-product-submit" type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creating…' : 'Create Product'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-screen"><span className="spinner" /> Loading catalog…</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">No products yet</div>
          <div className="empty-state__desc">Create your first product to start building quotes</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Product</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {products.map((p) => (
            <Link key={p._id} href={`/catalog/${p._id}`} className="card card--clickable">
              <div className="flex items-center justify-between">
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
                  <div className="flex gap-16" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <span>{p.tiers?.length ?? 0} tier{(p.tiers?.length ?? 0) !== 1 ? 's' : ''}</span>
                    <span>Created {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
