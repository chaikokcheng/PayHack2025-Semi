"use client";
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import styles from '../../page.module.css';
import { useCart } from '../../CartContext';

const menu = [
  {
    id: 1,
    name: { en: 'Nasi Lemak', zh: '椰浆饭' },
    price: 12.0,
    desc: 'Classic Malaysian coconut rice with sambal, egg, peanuts, and anchovies.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Per 100g: 189 kcal, 28g carbs, 4g fat, 8g protein',
    addOns: [
      { label: 'Extra Egg', price: 2 },
      { label: 'More Sambal', price: 1 },
      { label: 'Fried Chicken', price: 5 },
    ],
  },
  {
    id: 2,
    name: { en: 'Teh Tarik', zh: '拉茶' },
    price: 3.5,
    desc: 'Frothy pulled milk tea, a Malaysian favorite.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Per 100g: 104 kcal, 18g carbs, 3g fat, 2g protein',
    addOns: [
      { label: 'Less Sugar', price: 0 },
      { label: 'Ice', price: 0 },
    ],
  },
  {
    id: 3,
    name: { en: 'Roti Canai', zh: '印度煎饼' },
    price: 2.5,
    desc: 'Flaky flatbread served with dhal and curry.',
    img: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Per 100g: 241 kcal, 19g carbs, 10g fat, 17g protein',
    addOns: [
      { label: 'Extra Curry', price: 1 },
      { label: 'Add Cheese', price: 2 },
    ],
  },
  {
    id: 4,
    name: { en: 'Char Kway Teow', zh: '炒粿条' },
    price: 10.0,
    desc: 'Stir-fried flat rice noodles with prawns, egg, and bean sprouts.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Per 100g: 180 kcal, 30g carbs, 6g fat, 7g protein',
    addOns: [
      { label: 'Extra Prawns', price: 4 },
      { label: 'No Chili', price: 0 },
    ],
  },
  {
    id: 5,
    name: { en: 'Laksa', zh: '叻沙' },
    price: 11.0,
    desc: 'Spicy noodle soup with coconut milk, shrimp, and tofu.',
    img: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Per 100g: 210 kcal, 25g carbs, 8g fat, 9g protein',
    addOns: [
      { label: 'Extra Tofu', price: 1 },
      { label: 'Add Fish Cake', price: 2 },
    ],
  },
  {
    id: 6,
    name: { en: 'Chicken Rice', zh: '鸡饭' },
    price: 9.0,
    desc: 'Steamed chicken with fragrant rice and chili sauce.',
    img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Per 100g: 160 kcal, 22g carbs, 4g fat, 10g protein',
    addOns: [
      { label: 'Extra Chicken', price: 3 },
      { label: 'More Chili Sauce', price: 0 },
    ],
  },
  {
    id: 7,
    name: { en: 'Cendol', zh: '煎蕊' },
    price: 6.0,
    desc: 'Iced dessert with green rice flour jelly, coconut milk, and palm sugar.',
    img: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Per 100g: 120 kcal, 28g carbs, 3g fat, 1g protein',
    addOns: [
      { label: 'Extra Gula Melaka', price: 1 },
      { label: 'Add Red Beans', price: 1 },
    ],
  },
  {
    id: 8,
    name: { en: 'Milo Dinosaur', zh: '美禄恐龙' },
    price: 5.0,
    desc: 'Iced Milo drink topped with extra Milo powder.',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    nutrition: 'Per 100g: 140 kcal, 22g carbs, 4g fat, 2g protein',
    addOns: [
      { label: 'Extra Milo Powder', price: 1 },
      { label: 'Less Ice', price: 0 },
    ],
  },
];

export default function FoodDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const food = menu.find(item => item.id === id);
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  if (!food) {
    return <main style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}><div className={styles.card}>Food not found.</div></main>;
  }

  const handleAddOnChange = (idx: number) => {
    setSelectedAddOns(selectedAddOns.includes(idx)
      ? selectedAddOns.filter(i => i !== idx)
      : [...selectedAddOns, idx]);
  };

  const addOnTotal = selectedAddOns.reduce((sum, idx) => sum + food.addOns[idx].price, 0);
  const total = (food.price + addOnTotal) * qty;

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <Image src={food.img} alt={food.name.en} width={480} height={240} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
        <div style={{ padding: 24 }}>
          <div className={styles.sectionTitle} style={{ marginBottom: 4 }}>{food.name.en}</div>
          <div style={{ color: '#757575', marginBottom: 8 }}>{food.desc}</div>
          <div style={{ color: '#757575', fontSize: 14, marginBottom: 12 }}>{food.nutrition}</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary-dark)', marginBottom: 18 }}>RM {food.price.toFixed(2)}</div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Add-ons</div>
            {food.addOns.map((add, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, fontSize: 15 }}>
                <input
                  type="checkbox"
                  checked={selectedAddOns.includes(idx)}
                  onChange={() => handleAddOnChange(idx)}
                  style={{ marginRight: 10 }}
                />
                {add.label} {add.price > 0 && <span style={{ color: '#E91E63', marginLeft: 4 }}>+RM {add.price}</span>}
              </label>
            ))}
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Notes to Merchant</div>
            <textarea
              className={styles.input}
              rows={2}
              placeholder="E.g. No peanuts, extra spicy, etc."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ resize: 'vertical', minHeight: 40 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontWeight: 600, marginRight: 16 }}>Quantity</div>
            <button
              className={styles.quantityButton}
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={qty === 1}
            >-</button>
            <span className={styles.quantityDisplay}>{qty}</span>
            <button
              className={styles.quantityButton}
              onClick={() => setQty(q => q + 1)}
            >+</button>
          </div>
          <button
            className={styles.primaryButton}
            style={{ marginTop: 8, background: '#E91E63' }}
            onClick={() => {
              addToCart({
                id: food.id,
                name: food.name.en,
                price: food.price + addOnTotal,
                quantity: qty,
                addOns: selectedAddOns.map(idx => food.addOns[idx]),
                notes,
                img: food.img,
              });
              router.push('/menu');
            }}
          >
            Add to Cart • RM {total.toFixed(2)}
          </button>
          <button
            className={styles.backButton}
            onClick={() => router.push('/menu')}
          >
            &larr; Back to Menu
          </button>
        </div>
      </div>
    </main>
  );
} 