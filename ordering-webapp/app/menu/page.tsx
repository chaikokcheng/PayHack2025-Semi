"use client";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../page.module.css';
import { useCart } from '../CartContext';

const menu = [
  {
    id: 1,
    name: { en: 'Nasi Lemak', zh: '椰浆饭' },
    price: 12.0,
    desc: 'Classic Malaysian coconut rice with sambal, egg, peanuts, and anchovies.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    tag: 'Most ordered',
  },
  {
    id: 2,
    name: { en: 'Teh Tarik', zh: '拉茶' },
    price: 3.5,
    desc: 'Frothy pulled milk tea, a Malaysian favorite.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    tag: '',
  },
  {
    id: 3,
    name: { en: 'Roti Canai', zh: '印度煎饼' },
    price: 2.5,
    desc: 'Flaky flatbread served with dhal and curry.',
    img: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    tag: 'Recommended',
  },
  {
    id: 4,
    name: { en: 'Char Kway Teow', zh: '炒粿条' },
    price: 10.0,
    desc: 'Stir-fried flat rice noodles with prawns, egg, and bean sprouts.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    tag: 'Spicy',
  },
  {
    id: 5,
    name: { en: 'Laksa', zh: '叻沙' },
    price: 11.0,
    desc: 'Spicy noodle soup with coconut milk, shrimp, and tofu.',
    img: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    tag: '',
  },
  {
    id: 6,
    name: { en: 'Chicken Rice', zh: '鸡饭' },
    price: 9.0,
    desc: 'Steamed chicken with fragrant rice and chili sauce.',
    img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
    tag: 'Popular',
  },
  {
    id: 7,
    name: { en: 'Cendol', zh: '煎蕊' },
    price: 6.0,
    desc: 'Iced dessert with green rice flour jelly, coconut milk, and palm sugar.',
    img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
    tag: 'Dessert',
  },
  {
    id: 8,
    name: { en: 'Milo Dinosaur', zh: '美禄恐龙' },
    price: 5.0,
    desc: 'Iced Milo drink topped with extra Milo powder.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    tag: 'Drink',
  },
];

export default function MenuPage() {
  const router = useRouter();
  const language = 'en';
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: 16, position: 'relative' }}>
      <h2 className={styles.sectionTitle} style={{ marginBottom: 8 }}>🍽️ Set Meal</h2>
      <div style={{ marginBottom: 24, color: '#757575', fontWeight: 500 }}>Choose your meal below</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {menu.map(item => (
          <div
            key={item.id}
            className={styles.card}
            style={{ display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer', padding: 18 }}
            onClick={() => router.push(`/menu/${item.id}`)}
          >
            <Image
              src={item.img}
              alt={item.name[language]}
              width={90}
              height={90}
              style={{ borderRadius: 16, objectFit: 'cover' }}
            />
            <div style={{ flex: 1 }}>
              {item.tag && <div style={{ color: '#22C55E', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{item.tag}</div>}
              <div style={{ fontWeight: 700, fontSize: 18 }}>{item.name[language]}</div>
              <div style={{ color: '#757575', fontSize: 14, margin: '4px 0 8px 0' }}>{item.desc}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary-dark)' }}>RM {item.price.toFixed(2)}</div>
            </div>
            <button
              className={styles.primaryButton}
              style={{ width: 44, height: 44, borderRadius: 12, fontSize: 28, padding: 0, minWidth: 0, background: '#E91E63' }}
              onClick={e => { e.stopPropagation(); router.push(`/menu/${item.id}`); }}
            >+
            </button>
          </div>
        ))}
      </div>
      {/* Floating Cart Button */}
      <button
        onClick={() => router.push('/payment')}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 32,
          zIndex: 100,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#E91E63',
          color: 'white',
          boxShadow: '0 4px 16px rgba(233,30,99,0.18)',
          border: '3px solid white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        aria-label="Go to cart"
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1.5"/><circle cx="19" cy="21" r="1.5"/><path d="M5 6h2l1.68 9.39a2 2 0 0 0 2 1.61h6.72a2 2 0 0 0 2-1.61L21 8H7"/></svg>
        </span>
        {cartCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: '#F44336',
            color: 'white',
            borderRadius: '50%',
            minWidth: 22,
            height: 22,
            fontSize: 14,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            border: '2px solid white',
            zIndex: 101,
          }}>
            {cartCount}
          </span>
        )}
      </button>
    </main>
  );
} 