"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

export default function Onboarding() {
  const [name, setName] = useState('');
  const router = useRouter();

  return (
    <main style={{ maxWidth: 420, margin: '0 auto', padding: 24 }}>
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>👋 Welcome!</h2>
        <p style={{ marginBottom: 20 }}>
          This is the merchant ordering system. Please enter your name (optional) to join the group order, or continue as guest.
        </p>
        <input
          className={styles.input}
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button
          className={styles.primaryButton}
          style={{ background: '#E91E63' }}
          onClick={() => router.push(`/menu?name=${encodeURIComponent(name)}`)}
        >
          Continue to Menu
        </button>
      </div>
    </main>
  );
} 