'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productApi } from '@/api/productApi';
import type { Product, Tier, Feature, TierConfig, Availability, PricingModel } from '@/types';

type ActiveTab = 'tiers' | 'features' | 'addons';

// ============================================================
// Product Detail Page
// ============================================================

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('tiers');
  const [pageError, setPageError] = useState('');

  const loadProduct = useCallback(async () => {
    try {
      const data = await productApi.getById(productId);
      setProduct(data);
    } catch (e: unknown) {
      setPageError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { loadProduct(); }, [loadProduct]);

  if (loading) return <div className="loading-screen container"><span className="spinner" /> Loading product…</div>;
  if (!product) return <div className="container page"><div className="alert alert-error">{pageError || 'Product not found'}</div></div>;

  return (
    <div className="container page">
      <div className="mb-24">
        <Link href="/catalog" className="text-muted" style={{ fontSize: '0.85rem' }}>← Back to Catalog</Link>
      </div>
      <div className="flex items-center justify-between mb-32">
        <div>
          <h1 className="page-title">{product.name}</h1>
          <p className="page-subtitle">Configure tiers, features, and add-on pricing</p>
        </div>
      </div>

      {pageError && <div className="alert alert-error mb-24">{pageError}</div>}

      <div className="tabs mb-32">
        <button className={`tab ${activeTab === 'tiers' ? 'tab--active' : ''}`} onClick={() => setActiveTab('tiers')}>Products &amp; Tiers</button>
        <button className={`tab ${activeTab === 'features' ? 'tab--active' : ''}`} onClick={() => setActiveTab('features')}>Feature Matrix</button>
        <button className={`tab ${activeTab === 'addons' ? 'tab--active' : ''}`} onClick={() => setActiveTab('addons')}>Add-on Pricing</button>
      </div>

      {activeTab === 'tiers' && <TiersTab product={product} onUpdate={loadProduct} setError={setPageError} />}
      {activeTab === 'features' && <FeaturesTab product={product} onUpdate={loadProduct} setError={setPageError} />}
      {activeTab === 'addons' && <AddonsTab product={product} onUpdate={loadProduct} setError={setPageError} />}
    </div>
  );
}

// ============================================================
// Tab: Tiers
// ============================================================

function TiersTab({ product, onUpdate, setError }: { product: Product; onUpdate: () => void; setError: (e: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', basePricePerSeat: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', basePricePerSeat: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await productApi.addTier(product._id, {
        name: form.name.trim(),
        basePricePerSeat: parseFloat(form.basePricePerSeat),
      });
      setForm({ name: '', basePricePerSeat: '' });
      setShowForm(false);
      onUpdate();
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (tierId: string) => {
    setSaving(true);
    try {
      await productApi.updateTier(product._id, tierId, {
        name: editForm.name,
        basePricePerSeat: parseFloat(editForm.basePricePerSeat),
      });
      setEditingId(null);
      onUpdate();
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-16">
        <h2 className="section-title" style={{ margin: 0 }}>Tiers &amp; Base Pricing</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Add Tier</button>
      </div>

      {showForm && (
        <div className="card mb-24" style={{ borderColor: 'var(--color-primary)' }}>
          <form onSubmit={handleAdd}>
            <div className="form-row form-row--2 mb-16">
              <div className="form-group">
                <label>Tier Name</label>
                <input id="tier-name" placeholder="e.g. Starter" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Base Price (USD / seat / month)</label>
                <input id="tier-price" type="number" min="0" step="0.01" placeholder="e.g. 50" value={form.basePricePerSeat} onChange={(e) => setForm((f) => ({ ...f, basePricePerSeat: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-8">
              <button id="add-tier-submit" type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Adding…' : 'Add Tier'}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {product.tiers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">No tiers yet</div>
          <div className="empty-state__desc">Add tiers like Starter, Growth, Enterprise with their base prices.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Tier Name</th><th>Base Price (per seat/month)</th><th></th></tr></thead>
            <tbody>
              {product.tiers.map((tier) => (
                <tr key={tier._id}>
                  <td>
                    {editingId === tier._id
                      ? <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} style={{ width: 160 }} />
                      : <span style={{ fontWeight: 600 }}>{tier.name}</span>}
                  </td>
                  <td>
                    {editingId === tier._id
                      ? <input type="number" min="0" step="0.01" value={editForm.basePricePerSeat} onChange={(e) => setEditForm((f) => ({ ...f, basePricePerSeat: e.target.value }))} style={{ width: 100 }} />
                      : <span className="font-mono">${tier.basePricePerSeat.toFixed(2)}</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {editingId === tier._id ? (
                      <div className="flex gap-8" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary btn-sm" disabled={saving} onClick={() => handleUpdate(tier._id)}>{saving ? '…' : 'Save'}</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(tier._id); setEditForm({ name: tier.name, basePricePerSeat: String(tier.basePricePerSeat) }); }}>Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card mt-32" style={{ background: 'var(--color-surface-2)', border: 'none' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          <strong style={{ color: 'var(--color-text-secondary)' }}>Term length discounts</strong> (global across all products):<br />
          Monthly → 0% · Annual → 15% · Two-year → 25% — applied to the per-seat base price only.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Tab: Feature Matrix
// ============================================================

const AVAILABILITY_OPTIONS: Availability[] = ['included', 'add-on', 'not_available'];
const AVAIL_LABELS: Record<Availability, string> = { included: 'Included', 'add-on': 'Add-on', not_available: 'Not available' };

function FeaturesTab({ product, onUpdate, setError }: { product: Product; onUpdate: () => void; setError: (e: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, Record<string, Availability>>>({});

  const handleAddFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await productApi.addFeature(product._id, newFeatureName.trim());
      setNewFeatureName('');
      setShowForm(false);
      onUpdate();
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const getAvailability = (feature: Feature, tierId: string): Availability =>
    pendingChanges[feature._id]?.[tierId] ?? feature.tierConfigs.find((tc) => tc.tierId === tierId)?.availability ?? 'not_available';

  const setAvailability = (featureId: string, tierId: string, val: Availability) =>
    setPendingChanges((prev) => ({ ...prev, [featureId]: { ...(prev[featureId] ?? {}), [tierId]: val } }));

  const saveChanges = async () => {
    setSaving(true);
    try {
      for (const [featureId, tierChanges] of Object.entries(pendingChanges)) {
        const feature = product.features.find((f) => f._id === featureId);
        if (!feature) continue;
        const updatedConfigs = feature.tierConfigs.map((tc) => ({
          ...tc,
          availability: tierChanges[tc.tierId] ?? tc.availability,
          pricingModel: (tierChanges[tc.tierId] ?? tc.availability) === 'add-on' ? tc.pricingModel : null,
          pricingValue: (tierChanges[tc.tierId] ?? tc.availability) === 'add-on' ? tc.pricingValue : null,
        }));
        await productApi.updateFeature(product._id, featureId, { tierConfigs: updatedConfigs });
      }
      setPendingChanges({});
      onUpdate();
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const hasPending = Object.keys(pendingChanges).length > 0;

  if (product.tiers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__title">Add tiers first</div>
        <div className="empty-state__desc">Define at least one tier before configuring features.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-16">
        <h2 className="section-title" style={{ margin: 0 }}>Feature Availability by Tier</h2>
        <div className="flex gap-8">
          {hasPending && <button className="btn btn-primary btn-sm" disabled={saving} onClick={saveChanges}>{saving ? 'Saving…' : '✓ Save Changes'}</button>}
          <button className="btn btn-secondary btn-sm" id="add-feature-btn" onClick={() => setShowForm(true)}>+ Add Feature</button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-24" style={{ borderColor: 'var(--color-primary)' }}>
          <form onSubmit={handleAddFeature}>
            <div className="form-group mb-16">
              <label>Feature Name</label>
              <input id="feature-name" placeholder="e.g. Single Sign-On (SSO)" value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} autoFocus />
            </div>
            <div className="flex gap-8">
              <button id="add-feature-submit" type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? '…' : 'Add Feature'}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {product.features.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">No features yet</div>
          <div className="empty-state__desc">Add features and configure which tiers include them, offer as add-ons, or exclude them.</div>
        </div>
      ) : (
        <>
          {hasPending && <div className="alert alert-info mb-16">You have unsaved changes. Click &ldquo;Save Changes&rdquo; to apply them.</div>}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  {product.tiers.map((t) => <th key={t._id} style={{ textAlign: 'center' }}>{t.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {product.features.map((feature) => (
                  <tr key={feature._id}>
                    <td style={{ fontWeight: 600 }}>{feature.name}</td>
                    {product.tiers.map((tier) => {
                      const avail = getAvailability(feature, tier._id);
                      return (
                        <td key={tier._id} style={{ textAlign: 'center' }}>
                          <select
                            value={avail}
                            onChange={(e) => setAvailability(feature._id, tier._id, e.target.value as Availability)}
                            style={{
                              width: 'auto', fontSize: '0.82rem', padding: '4px 28px 4px 10px',
                              background: avail === 'included' ? 'var(--color-success-light)' : avail === 'add-on' ? 'var(--color-warning-light)' : 'var(--color-surface-2)',
                              color: avail === 'included' ? 'var(--color-success)' : avail === 'add-on' ? 'var(--color-warning)' : 'var(--color-text-muted)',
                              border: '1px solid var(--color-border)',
                            }}
                          >
                            {AVAILABILITY_OPTIONS.map((o) => <option key={o} value={o}>{AVAIL_LABELS[o]}</option>)}
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// Tab: Add-on Pricing
// ============================================================

const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  fixed_monthly: 'Fixed monthly',
  per_seat: 'Per seat per month',
  percent_of_product: '% of product cost',
};

function AddonsTab({ product, onUpdate, setError }: { product: Product; onUpdate: () => void; setError: (e: string) => void }) {
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ pricingModel: PricingModel; pricingValue: string }>({ pricingModel: 'fixed_monthly', pricingValue: '' });

  const addonCells: { feature: Feature; tier: Tier; config: TierConfig }[] = product.features.flatMap((feature) =>
    feature.tierConfigs.flatMap((config) => {
      if (config.availability !== 'add-on') return [];
      const tier = product.tiers.find((t) => t._id === config.tierId);
      return tier ? [{ feature, tier, config }] : [];
    })
  );

  const cellKey = (fId: string, tId: string) => `${fId}::${tId}`;

  const saveAddon = async (feature: Feature, tierId: string) => {
    const k = cellKey(feature._id, tierId);
    setSavingKey(k);
    try {
      const updatedConfigs = feature.tierConfigs.map((tc) =>
        tc.tierId === tierId ? { ...tc, pricingModel: editForm.pricingModel, pricingValue: parseFloat(editForm.pricingValue) } : tc
      );
      await productApi.updateFeature(product._id, feature._id, { tierConfigs: updatedConfigs });
      setEditingKey(null);
      onUpdate();
    } catch (e: unknown) { setError((e as Error).message); }
    finally { setSavingKey(null); }
  };

  if (addonCells.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__title">No add-ons configured</div>
        <div className="empty-state__desc">Mark features as &ldquo;Add-on&rdquo; in the Feature Matrix tab first, then set prices here.</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title mb-16">Add-on Pricing</h2>
      <p className="text-muted mb-24" style={{ fontSize: '0.88rem' }}>
        Set the pricing model and value for each add-on. The same feature can have different pricing in different tiers.
      </p>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Tier</th><th>Feature</th><th>Pricing Model</th><th>Value</th><th>Example</th><th></th></tr>
          </thead>
          <tbody>
            {addonCells.map(({ feature, tier, config }) => {
              const k = cellKey(feature._id, tier._id);
              const isEditing = editingKey === k;
              return (
                <tr key={k}>
                  <td><span style={{ fontWeight: 600 }}>{tier.name}</span></td>
                  <td>{feature.name}</td>
                  <td>
                    {isEditing
                      ? <select value={editForm.pricingModel} onChange={(e) => setEditForm((f) => ({ ...f, pricingModel: e.target.value as PricingModel }))} style={{ width: 'auto' }}>
                          {(['fixed_monthly', 'per_seat', 'percent_of_product'] as PricingModel[]).map((m) => <option key={m} value={m}>{PRICING_MODEL_LABELS[m]}</option>)}
                        </select>
                      : config.pricingModel
                        ? <span className="badge badge-primary">{PRICING_MODEL_LABELS[config.pricingModel]}</span>
                        : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    {isEditing
                      ? <input type="number" min="0" step="0.01" value={editForm.pricingValue} onChange={(e) => setEditForm((f) => ({ ...f, pricingValue: e.target.value }))} style={{ width: 80 }} />
                      : config.pricingValue != null
                        ? <span className="font-mono">{config.pricingModel === 'percent_of_product' ? `${config.pricingValue}%` : `$${config.pricingValue}`}</span>
                        : <span className="text-muted">—</span>}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    {config.pricingModel && config.pricingValue != null
                      ? config.pricingModel === 'fixed_monthly' ? `$${config.pricingValue}/month flat`
                        : config.pricingModel === 'per_seat' ? `$${config.pricingValue} × seats/month`
                        : `${config.pricingValue}% of product cost`
                      : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {isEditing
                      ? <div className="flex gap-8" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn btn-primary btn-sm" disabled={savingKey === k} onClick={() => saveAddon(feature, tier._id)}>{savingKey === k ? '…' : 'Save'}</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditingKey(null)}>Cancel</button>
                        </div>
                      : <button className="btn btn-ghost btn-sm" onClick={() => { setEditingKey(k); setEditForm({ pricingModel: config.pricingModel ?? 'fixed_monthly', pricingValue: config.pricingValue != null ? String(config.pricingValue) : '' }); }}>
                          {config.pricingValue != null ? 'Edit' : 'Set Price'}
                        </button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
