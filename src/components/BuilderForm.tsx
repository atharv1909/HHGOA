'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateTitle, MAX_REROLLS } from '@/lib/titleGenerator';
import styles from '@/styles/components/BuilderForm.module.css';

export interface BuilderData {
  name: string;
  stack: string;
  title: string;
  format: 'builder-id' | 'pfp';
  socials: Record<string, string>;
}

interface BuilderFormProps {
  data: BuilderData;
  onChange: (data: BuilderData) => void;
}

const SOCIAL_FIELDS = [
  { key: 'x', label: 'X / Twitter', placeholder: 'handle (no @)', sensitive: false },
  { key: 'github', label: 'GitHub', placeholder: 'username', sensitive: false },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'username', sensitive: false },
  { key: 'website', label: 'Website', placeholder: 'yoursite.com', sensitive: false },
  { key: 'email', label: 'Email', placeholder: 'you@email.com', sensitive: true },
  { key: 'phone', label: 'Phone', placeholder: '+91 ...', sensitive: true },
];

export default function BuilderForm({ data, onChange }: BuilderFormProps) {
  const [rerollCount, setRerollCount] = useState(0);
  const [showSocials, setShowSocials] = useState(false);
  const [enabledSocials, setEnabledSocials] = useState<Set<string>>(new Set());

  // Auto-generate title when name or stack changes
  useEffect(() => {
    if (data.name && data.stack) {
      const newTitle = generateTitle(data.name, data.stack, rerollCount);
      if (newTitle !== data.title) {
        onChange({ ...data, title: newTitle });
      }
    }
  }, [data.name, data.stack]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReroll = useCallback(() => {
    if (rerollCount >= MAX_REROLLS) return;
    const next = rerollCount + 1;
    setRerollCount(next);
    const newTitle = generateTitle(data.name, data.stack, next);
    onChange({ ...data, title: newTitle });
  }, [rerollCount, data, onChange]);

  const updateField = (field: keyof BuilderData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const toggleSocial = (key: string) => {
    const next = new Set(enabledSocials);
    if (next.has(key)) {
      next.delete(key);
      const newSocials = { ...data.socials };
      delete newSocials[key];
      onChange({ ...data, socials: newSocials });
    } else {
      next.add(key);
    }
    setEnabledSocials(next);
  };

  const updateSocial = (key: string, value: string) => {
    onChange({ ...data, socials: { ...data.socials, [key]: value } });
  };

  const hasSensitiveEnabled = Array.from(enabledSocials).some(
    k => SOCIAL_FIELDS.find(f => f.key === k)?.sensitive
  );

  return (
    <div className={styles.formContainer}>
      {/* Format toggle */}
      <div className={styles.formatToggle} role="radiogroup" aria-label="Output format">
        <button
          className={`${styles.formatOption} ${data.format === 'builder-id' ? styles.formatOptionActive : ''}`}
          onClick={() => updateField('format', 'builder-id')}
          role="radio"
          aria-checked={data.format === 'builder-id'}
        >
          Builder ID
        </button>
        <button
          className={`${styles.formatOption} ${data.format === 'pfp' ? styles.formatOptionActive : ''}`}
          onClick={() => updateField('format', 'pfp')}
          role="radio"
          aria-checked={data.format === 'pfp'}
        >
          PFP Frame
        </button>
      </div>

      {/* Name */}
      <div className={styles.inputGroup}>
        <label htmlFor="builder-name" className={styles.label}>Name</label>
        <input
          id="builder-name"
          className={styles.input}
          type="text"
          placeholder="Your name"
          value={data.name}
          onChange={e => updateField('name', e.target.value)}
          maxLength={30}
          autoComplete="name"
        />
      </div>

      {/* Stack */}
      <div className={styles.inputGroup}>
        <label htmlFor="builder-stack" className={styles.label}>Stack / Role</label>
        <input
          id="builder-stack"
          className={styles.input}
          type="text"
          placeholder="e.g. Full-Stack Dev, AI/ML, Product"
          value={data.stack}
          onChange={e => updateField('stack', e.target.value)}
          maxLength={40}
        />
      </div>

      {/* Builder Title */}
      {data.format === 'builder-id' && data.name && data.stack && (
        <div className={styles.inputGroup}>
          <span className={styles.label}>Builder Title</span>
          <div className={styles.titleRow}>
            <div className={styles.titlePill}>
              {data.title || '...'}
            </div>
            <button
              className={styles.rerollBtn}
              onClick={handleReroll}
              disabled={rerollCount >= MAX_REROLLS}
              aria-label="Regenerate builder title"
              title={rerollCount >= MAX_REROLLS ? 'No more rerolls' : 'Regenerate title'}
            >
              ♻️
            </button>
            <span className={styles.rerollCount}>
              {MAX_REROLLS - rerollCount} left
            </span>
          </div>
        </div>
      )}

      {/* Socials */}
      {data.format === 'builder-id' && (
        <>
          <button
            className={styles.socialsToggle}
            onClick={() => setShowSocials(!showSocials)}
            aria-expanded={showSocials}
            aria-controls="socials-grid"
          >
            <span className={`${styles.socialsToggleIcon} ${showSocials ? styles.socialsToggleIconOpen : ''}`}>
              +
            </span>
            <span>{showSocials ? 'Hide socials' : 'Add socials'}</span>
          </button>

          {showSocials && (
            <div id="socials-grid" className={styles.socialsGrid}>
              {SOCIAL_FIELDS.map(field => (
                <div key={field.key} className={styles.socialItem}>
                  <input
                    type="checkbox"
                    className={styles.socialCheckbox}
                    checked={enabledSocials.has(field.key)}
                    onChange={() => toggleSocial(field.key)}
                    id={`social-${field.key}`}
                    aria-label={`Include ${field.label}`}
                  />
                  <label htmlFor={`social-${field.key}`} className={styles.socialLabel}>
                    {field.label}
                  </label>
                  {enabledSocials.has(field.key) && (
                    <input
                      className={styles.socialInput}
                      type={field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : 'text'}
                      placeholder={field.placeholder}
                      value={data.socials[field.key] || ''}
                      onChange={e => updateSocial(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
              {hasSensitiveEnabled && (
                <p className={styles.privacyNote}>
                  Only add contact details you&apos;re comfortable sharing publicly.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
