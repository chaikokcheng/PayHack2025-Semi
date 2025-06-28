"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../page.module.css';
import { useCart } from '../CartContext';

// For React Native WebView postMessage
declare global {
  interface Window {
    ReactNativeWebView?: any;
  }
}

export default function PaymentPage() {
  const params = useSearchParams();
  const name = params.get('name') || '';
  const orderParam = params.get('order') || '[]';
  const { cart, clearCart, removePartialFromCart, paidAmount, setPaidAmount, paidPercent, setPaidPercent } = useCart();
  const orderItems = cart;
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [splitMode, setSplitMode] = useState<'full' | 'percent' | 'items'>('full');
  const [percent, setPercent] = useState(50);
  const [selected, setSelected] = useState<number[]>([]);
  const [paid, setPaid] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
  const router = useRouter();
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const paymentSuccessRef = useRef(false);

  let payAmount = 0;
  if (splitMode === 'full') payAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (splitMode === 'percent') payAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity * (percent / 100), 0);
  if (splitMode === 'items' && selected.length > 0) {
    payAmount = orderItems.filter((_, idx) => selected.includes(idx)).reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  const totalPaid = splitMode === 'percent' ? payAmount : 0;
  const totalLeft = splitMode === 'percent' ? total - payAmount : total - payAmount;

  // If any percent payment has been made, lock out 'items' mode
  const percentPaid = paidPercent > 0;

  // Listen for payment success from React Native WebView
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'paymentSuccess') {
          paymentSuccessRef.current = true;
          setPaid(true);
          setPaymentStatus('success');
          setWaitingForPayment(false);
        } else if (data && data.type === 'paymentFailed') {
          setPaid(true);
          setPaymentStatus('failed');
          setWaitingForPayment(false);
        }
      } catch {}
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handlePay = () => {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      setWaitingForPayment(true);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'pay',
        mode: splitMode,
        amount: payAmount,
        items: splitMode === 'items' ? orderItems.filter((_, idx) => selected.includes(idx)) : orderItems,
        percent: splitMode === 'percent' ? percent : undefined,
      }));
    } else {
      // fallback for browser testing - randomly determine success/failure
      setTimeout(() => {
        const isSuccess = Math.random() > 0.3; // 70% success rate
        setPaid(true);
        setPaymentStatus(isSuccess ? 'success' : 'failed');
        setWaitingForPayment(false);
      }, 1200);
    }
    
    // Only clear cart if payment is successful (will be handled in receipt view)
    if (splitMode === 'full') {
      // Don't clear cart yet - wait for payment result
    } else if (splitMode === 'percent') {
      setPaidAmount(paidAmount + payAmount);
      setPaidPercent(paidPercent + percent);
    } else if (splitMode === 'items') {
      // Don't remove items yet - wait for payment result
    }
  };

  const handleRetry = () => {
    setPaid(false);
    setPaymentStatus(null);
    setWaitingForPayment(false);
  };

  const handleContinue = () => {
    // Clear cart only if payment was successful
    if (paymentStatus === 'success') {
      if (splitMode === 'full') {
        clearCart();
        setPaidAmount(0);
        setPaidPercent(0);
      } else if (splitMode === 'items') {
        orderItems.forEach((item, idx) => {
          if (selected.includes(idx)) {
            removePartialFromCart(item.id, item.quantity, item.addOns, item.notes);
          }
        });
        setPaidAmount(0);
        setPaidPercent(0);
      }
    }
    router.push('/menu' + (name ? `?name=${encodeURIComponent(name)}` : ''));
  };

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>💳 Payment</h2>
        <div style={{ marginBottom: 18, color: '#757575' }}>Name: <b>{name || 'Guest'}</b></div>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Order Summary</div>
        <ul className={styles.list}>
          {orderItems.map((item: any, idx: number) => (
            <li key={idx} className={styles.listItem}>
              <span>{item.name}</span> x{item.quantity} <span style={{ color: '#757575' }}>RM {(item.price * item.quantity).toFixed(2)}</span>
              {splitMode === 'items' && (
                <input type="checkbox" checked={selected.includes(idx)} onChange={e => {
                  if (e.target.checked) setSelected([...selected, idx]);
                  else setSelected(selected.filter(i => i !== idx));
                }} style={{ marginLeft: 8 }} />
              )}
            </li>
          ))}
        </ul>
        <div style={{ marginBottom: 18 }}>
          <label style={{ marginRight: 12 }}>
            <input type="radio" checked={splitMode === 'full'} onChange={() => setSplitMode('full')} /> Pay Full
          </label>
          <label style={{ marginRight: 12 }}>
            <input type="radio" checked={splitMode === 'percent'} onChange={() => setSplitMode('percent')} /> Split by %
          </label>
          <label>
            <input
              type="radio"
              checked={splitMode === 'items'}
              onChange={() => {
                if (!percentPaid) setSplitMode('items');
              }}
              disabled={percentPaid}
            /> Pay for Items
          </label>
        </div>
        {splitMode === 'percent' && (
          <div style={{ marginBottom: 18 }}>
            <input type="range" min={1} max={100} value={percent} onChange={e => setPercent(Number(e.target.value))} />
            <span style={{ marginLeft: 10 }}>{percent}% (RM {(total * (percent / 100)).toFixed(2)})</span>
          </div>
        )}
        {splitMode === 'items' && (
          <div style={{ marginBottom: 18, color: '#757575', fontSize: 13 }}>
            Select which items you want to pay for above.
          </div>
        )}
        <div className={styles.total}>
          {paid && splitMode === 'percent' ? (
            <>
              Left to Pay: RM {totalLeft.toFixed(2)}
              <div style={{ color: '#22C55E', fontWeight: 600, fontSize: 15, marginTop: 4 }}>
                RM {totalPaid.toFixed(2)} paid ({paidPercent}%)
              </div>
            </>
          ) : (
            <>To Pay: RM {payAmount.toFixed(2)}</>
          )}
        </div>
        {!paid ? (
          <button
            className={styles.primaryButton}
            style={{ background: '#E91E63' }}
            onClick={handlePay}
            disabled={orderItems.length === 0 || (splitMode === 'items' && selected.length === 0) || waitingForPayment}
          >
            {waitingForPayment ? 'Waiting for Payment...' : 'Pay Now'}
          </button>
        ) : (
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ 
              padding: 20, 
              borderRadius: 12, 
              backgroundColor: paymentStatus === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `2px solid ${paymentStatus === 'success' ? '#22c55e' : '#ef4444'}`
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                marginBottom: 16,
                color: paymentStatus === 'success' ? '#22c55e' : '#ef4444',
                fontWeight: 'bold',
                fontSize: 18
              }}>
                {paymentStatus === 'success' ? '✅' : '❌'}
                {paymentStatus === 'success' ? 'Payment Complete!' : 'Payment Failed'}
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Receipt</div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                  Amount: RM {payAmount.toFixed(2)}
                </div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                  Transaction ID: {`TXN-${Date.now()}`}
                </div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                  Time: {new Date().toLocaleTimeString()}
                </div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                  Status: <span style={{ 
                    color: paymentStatus === 'success' ? '#22c55e' : '#ef4444',
                    fontWeight: 'bold'
                  }}>
                    {paymentStatus === 'success' ? 'COMPLETED' : 'FAILED'}
                  </span>
                </div>
              </div>

              {paymentStatus === 'failed' && (
                <div style={{ 
                  padding: 12, 
                  backgroundColor: '#fef2f2', 
                  borderRadius: 8,
                  border: '1px solid #fecaca'
                }}>
                  <div style={{ fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>
                    Payment Failed
                  </div>
                  <div style={{ fontSize: 13, color: '#666' }}>
                    Possible reasons:
                  </div>
                  <div style={{ fontSize: 13, color: '#666' }}>• Insufficient balance</div>
                  <div style={{ fontSize: 13, color: '#666' }}>• Network connectivity issues</div>
                  <div style={{ fontSize: 13, color: '#666' }}>• Payment method restrictions</div>
                  <div style={{ fontSize: 13, color: '#666' }}>• Transaction timeout</div>
                </div>
              )}
            </div>

            {paymentStatus === 'failed' && (
              <button
                className={styles.primaryButton}
                style={{ background: '#ef4444' }}
                onClick={handleRetry}
              >
                Try Again
              </button>
            )}

            <button
              className={styles.primaryButton}
              style={{ background: '#E91E63' }}
              onClick={handleContinue}
            >
              Continue
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => {
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'closeMerchant' }));
                }
              }}
            >
              Close Merchant
            </button>
          </div>
        )}
        <button className={styles.backButton} onClick={() => router.push('/menu' + (name ? `?name=${encodeURIComponent(name)}` : ''))}>
          &larr; Back to Menu
        </button>
      </div>
    </main>
  );
} 