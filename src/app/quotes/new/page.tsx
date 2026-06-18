'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi } from '@/api/productApi';
import { quoteApi } from '@/api/quoteApi';
import type { Product, Tier, Feature, TierConfig, TermLength, AddonInput } from '@/types';

const STEPS = ['Details', 'Product', 'Add-ons', 'Discount', 'Review'];

const TERM_OPTIONS: { value: TermLength; label: string; discount: string }[] = [
  { value: 'monthly', label: 'Monthly', discount: '0% discount' },
  { value: 'annual', label: 'Annual (12 months)', discount: '15% discount on per-seat price' },
  { value: 'two-year', label: 'Two-year (24 months)', discount: '25% discount on per-seat price' },
];

const TERM_MONTHS: Record<TermLength, number> = { monthly: 1, annual: 12, 'two-year': 24 };
const TERM_DISCOUNTS: Record<TermLength, number> = { monthly: 0, annual: 15, 'two-year': 25 };

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function NewQuotePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1: Details
  const [quoteName, setQuoteName] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Step 2: Product
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTierId, setSelectedTierId] = useState('');
  const [seats, setSeats] = useState<number>(1);
  const [termLength, setTermLength] = useState<TermLength>('monthly');

  // Step 3: Add-ons
  const [selectedAddons, setSelectedAddons] = useState<AddonInput[]>([]);

  // Step 4: Discount
  const [overallDiscount, setOverallDiscount] = useState<number>(0);

  // Misc
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoadingProducts(true);
    productApi.getAll()
      .then(setProducts)
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    if (!selectedProductId) return;
    setLoadingProduct(true);
    setSelectedProduct(null);
    setSelectedTierId('');
    setSelectedAddons([]);
    
    productApi.getById(selectedProductId)
      .then(setSelectedProduct)
      .finally(() => setLoadingProduct(false));
  }, [selectedProductId]);

  const selectedTier = selectedProduct?.tiers.find((t) => t._id === selectedTierId) ?? null;

  const availableAddons: { feature: Feature; config: TierConfig }[] = selectedProduct
    ? selectedProduct.features.flatMap((f) => {
        const config = f.tierConfigs.find((tc) => tc.tierId === selectedTierId);
        if (!config || config.availability !== 'add-on') return [];
        return [{ feature: f, config }];
      })
    : [];

  function toggleAddon(feature: Feature, config: TierConfig, checked: boolean) {
    if (checked) {
      setSelectedAddons((prev) => [
        ...prev,
        {
          featureId: feature._id,
          featureName: feature.name,
          pricingModel: config.pricingModel!,
          pricingValue: config.pricingValue!,
          addonSeats: config.pricingModel === 'per_seat' ? 1 : null,
        },
      ]);
    } else {
      setSelectedAddons((prev) => prev.filter((a) => a.featureId !== feature._id));
    }
  }

  function setAddonSeats(featureId: string, seats: number) {
    setSelectedAddons((prev) =>
      prev.map((a) => (a.featureId === featureId ? { ...a, addonSeats: seats } : a))
    );
  }

  // Live preview calculation
  function calcPreview() {
    if (!selectedTier) return { base: 0, addonTotal: 0, subtotal: 0, discount: 0, total: 0 };
    const months = TERM_MONTHS[termLength];
    const disc = TERM_DISCOUNTS[termLength];
    const base = seats * selectedTier.basePricePerSeat * months * (1 - disc / 100);
    let addonTotal = 0;
    for (const addon of selectedAddons) {
      switch (addon.pricingModel) {
        case 'fixed_monthly': addonTotal += addon.pricingValue * months; break;
        case 'per_seat': addonTotal += (addon.addonSeats ?? 0) * addon.pricingValue * months; break;
        case 'percent_of_product': addonTotal += (addon.pricingValue / 100) * base; break;
      }
    }
    const subtotal = base + addonTotal;
    const discount = (overallDiscount / 100) * subtotal;
    return { base, addonTotal, subtotal, discount, total: subtotal - discount };
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const data = await quoteApi.create({
        quoteName, customerName,
        productId: selectedProductId,
        tierId: selectedTierId,
        seats, termLength,
        selectedAddons,
        overallDiscountPercent: overallDiscount,
      });
      router.push(`/quotes/${data.quoteId}`);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Something went wrong');
      setSubmitting(false);
    }
  }

  function canGoNext() {
    if (step === 0) return quoteName.trim() && customerName.trim();
    if (step === 1) return selectedProductId && selectedTierId && seats > 0;
    if (step === 2) {
      // All selected per_seat add-ons must have addonSeats > 0
      return selectedAddons.every((a) => a.pricingModel !== 'per_seat' || (a.addonSeats ?? 0) > 0);
    }
    return true;
  }

  const preview = calcPreview();

  return (
    <div className="container page" style={{ maxWidth: 800 }}>
      <h1 className="page-title mb-8">New Quote</h1>
      <p className="page-subtitle mb-32">Build a quote step by step</p>

      {/* Step indicator */}
      <div className="steps">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`step ${i < step ? 'step--done' : i === step ? 'step--active' : ''}`}
          >
            <div className="step__num">{i < step ? '✓' : i + 1}</div>
            <div className="step__label">{s}</div>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error mb-24">{error}</div>}

      {/* Step 0: Details */}
      {step === 0 && (
        <div className="card">
          <h2 className="section-title">Quote Details</h2>
          <div className="form-row form-row--2 mb-16">
            <div className="form-group">
              <label htmlFor="quote-name">Quote Name</label>
              <input id="quote-name" placeholder="e.g. Acme Corp - Q3 2026 Proposal"
                value={quoteName} onChange={(e) => setQuoteName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="customer-name">Customer Name</label>
              <input id="customer-name" placeholder="e.g. Acme Corporation"
                value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Product */}
      {step === 1 && (
        <div className="card">
          <h2 className="section-title">Product & Terms</h2>
          <div className="form-group mb-16">
            <label htmlFor="select-product">Product</label>
            {loadingProducts ? (
              <div className="text-muted">Loading products…</div>
            ) : (
              <select id="select-product" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                <option value="">Select a product…</option>
                {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            )}
          </div>

          {selectedProductId && (
            <>
              {loadingProduct ? (
                <div className="text-muted">Loading tiers…</div>
              ) : selectedProduct ? (
                <div className="form-group mb-16">
                  <label htmlFor="select-tier">Tier</label>
                  <select id="select-tier" value={selectedTierId} onChange={(e) => setSelectedTierId(e.target.value)}>
                    <option value="">Select a tier…</option>
                    {selectedProduct.tiers.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} — ${t.basePricePerSeat}/seat/month</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </>
          )}

          <div className="form-row form-row--2 mb-16">
            <div className="form-group">
              <label htmlFor="seats">Number of Seats</label>
              <input id="seats" type="number" min="1" value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value) || 1)} />
            </div>
            <div className="form-group">
              <label htmlFor="term-length">Term Length</label>
              <select id="term-length" value={termLength} onChange={(e) => setTermLength(e.target.value as TermLength)}>
                {TERM_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label} ({t.discount})</option>
                ))}
              </select>
            </div>
          </div>

          {selectedTier && (
            <div className="card mt-16" style={{ background: 'var(--color-surface-2)', border: 'none' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                <strong>Base cost preview:</strong>{' '}
                {fmt(preview.base)} ({seats} seat{seats !== 1 ? 's' : ''} × {fmt(selectedTier.basePricePerSeat)}/seat/mo × {TERM_MONTHS[termLength]} months{TERM_DISCOUNTS[termLength] > 0 ? ` × (1 − ${TERM_DISCOUNTS[termLength]}%)` : ''})
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Add-ons */}
      {step === 2 && (
        <div className="card">
          <h2 className="section-title">Add-ons</h2>
          {availableAddons.length === 0 ? (
            <p className="text-muted">No add-ons are available for the <strong>{selectedTier?.name}</strong> tier.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {availableAddons.map(({ feature, config }) => {
                const isSelected = selectedAddons.some((a) => a.featureId === feature._id);
                const addon = selectedAddons.find((a) => a.featureId === feature._id);
                return (
                  <div key={feature._id} className="card" style={{
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    background: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-2)',
                    padding: 16,
                  }}>
                    <div className="flex items-center gap-16">
                      <input
                        type="checkbox"
                        id={`addon-${feature._id}`}
                        checked={isSelected}
                        onChange={(e) => toggleAddon(feature, config, e.target.checked)}
                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                      />
                      <label htmlFor={`addon-${feature._id}`} style={{ flex: 1, cursor: 'pointer' }}>
                        <div style={{ fontWeight: 600 }}>{feature.name}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {config.pricingModel === 'fixed_monthly' && `${fmt(config.pricingValue!)}/month flat`}
                          {config.pricingModel === 'per_seat' && `${fmt(config.pricingValue!)}/seat/month`}
                          {config.pricingModel === 'percent_of_product' && `${config.pricingValue}% of product cost`}
                        </div>
                      </label>
                    </div>
                    {isSelected && config.pricingModel === 'per_seat' && (
                      <div className="form-group mt-16" style={{ maxWidth: 200 }}>
                        <label htmlFor={`addon-seats-${feature._id}`}>
                          Seats for this add-on (can differ from product seats)
                        </label>
                        <input
                          id={`addon-seats-${feature._id}`}
                          type="number" min="1"
                          value={addon?.addonSeats ?? 1}
                          onChange={(e) => setAddonSeats(feature._id, parseInt(e.target.value) || 1)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Discount */}
      {step === 3 && (
        <div className="card">
          <h2 className="section-title">Overall Quote Discount (Optional)</h2>
          <p className="text-muted mb-24" style={{ fontSize: '0.88rem' }}>
            An additional percentage discount applied to the entire quote total. This is on top of any term length discount.
          </p>
          <div className="form-group" style={{ maxWidth: 200 }}>
            <label htmlFor="overall-discount">Discount (%)</label>
            <input
              id="overall-discount"
              type="number" min="0" max="100" step="0.5"
              value={overallDiscount}
              onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
            />
          </div>
          {overallDiscount > 0 && (
            <div className="alert alert-info mt-16">
              Applied at the end: {overallDiscount}% off the full subtotal of {fmt(preview.subtotal)} = <strong>{fmt(preview.discount)} savings</strong>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="card">
          <h2 className="section-title">Review Quote</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px 24px', marginBottom: 24, fontSize: '0.9rem' }}>
            <span className="text-muted">Quote Name</span><span style={{ fontWeight: 600 }}>{quoteName}</span>
            <span className="text-muted">Customer</span><span>{customerName}</span>
            <span className="text-muted">Product</span><span>{selectedProduct?.name}</span>
            <span className="text-muted">Tier</span><span>{selectedTier?.name}</span>
            <span className="text-muted">Seats</span><span>{seats}</span>
            <span className="text-muted">Term</span><span>{TERM_OPTIONS.find((t) => t.value === termLength)?.label} ({TERM_OPTIONS.find((t) => t.value === termLength)?.discount})</span>
          </div>

          <div className="table-wrapper mb-24">
            <table>
              <thead>
                <tr>
                  <th>Line Item</th>
                  <th>Calculation</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>{selectedProduct?.name} — {selectedTier?.name} tier</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    {seats} seats × {fmt(selectedTier?.basePricePerSeat ?? 0)}/seat/mo × {TERM_MONTHS[termLength]} months{TERM_DISCOUNTS[termLength] > 0 ? ` × (1 − ${TERM_DISCOUNTS[termLength]}%)` : ''}
                  </td>
                  <td className="text-right font-mono">{fmt(preview.base)}</td>
                </tr>
                {selectedAddons.map((addon) => (
                  <tr key={addon.featureId}>
                    <td>Add-on: {addon.featureName}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      {addon.pricingModel === 'fixed_monthly' && `${fmt(addon.pricingValue)}/mo × ${TERM_MONTHS[termLength]} months`}
                      {addon.pricingModel === 'per_seat' && `${addon.addonSeats} seats × ${fmt(addon.pricingValue)}/seat/mo × ${TERM_MONTHS[termLength]} months`}
                      {addon.pricingModel === 'percent_of_product' && `${addon.pricingValue}% of ${fmt(preview.base)}`}
                    </td>
                    <td className="text-right font-mono">
                      {fmt(
                        addon.pricingModel === 'fixed_monthly' ? addon.pricingValue * TERM_MONTHS[termLength]
                        : addon.pricingModel === 'per_seat' ? (addon.addonSeats ?? 0) * addon.pricingValue * TERM_MONTHS[termLength]
                        : (addon.pricingValue / 100) * preview.base
                      )}
                    </td>
                  </tr>
                ))}
                {overallDiscount > 0 && (
                  <tr>
                    <td>Overall Discount</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{overallDiscount}% off subtotal</td>
                    <td className="text-right font-mono text-danger">−{fmt(preview.discount)}</td>
                  </tr>
                )}
                <tr style={{ background: 'var(--color-primary-light)' }}>
                  <td colSpan={2} style={{ fontWeight: 800, color: 'var(--color-primary)' }}>TOTAL</td>
                  <td className="text-right font-mono" style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                    {fmt(preview.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-24">
        <button
          className="btn btn-ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          ← Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            id="next-step-btn"
            className="btn btn-primary"
            onClick={() => { setError(''); setStep((s) => s + 1); }}
            disabled={!canGoNext()}
          >
            Next →
          </button>
        ) : (
          <button
            id="save-quote-btn"
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving…' : '✓ Save & Share Quote'}
          </button>
        )}
      </div>
    </div>
  );
}
