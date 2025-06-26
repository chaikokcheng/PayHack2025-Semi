import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: 32 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>🍽️ Merchant Ordering System</h1>
      <p style={{ marginBottom: 24 }}>
        Welcome to the PinkPay Merchant Ordering System demo. This webapp is launched when a customer scans a merchant QR code in the mobile app.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
        <li style={{ marginBottom: 16 }}>
          <Link href="/onboarding" style={{ fontSize: 18, color: '#ec4899', textDecoration: 'underline' }}>Onboarding Page</Link>
        </li>
        <li style={{ marginBottom: 16 }}>
          <Link href="/menu" style={{ fontSize: 18, color: '#ec4899', textDecoration: 'underline' }}>Menu Page</Link>
        </li>
        <li>
          <Link href="/payment" style={{ fontSize: 18, color: '#ec4899', textDecoration: 'underline' }}>Payment Page</Link>
        </li>
      </ul>
      <p style={{ color: '#666', fontSize: 14 }}>
        (In production, the flow will be: Onboarding → Menu → Payment, with data passed from the QR/menu JSON.)
      </p>
    </main>
  );
}
