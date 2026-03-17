import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { supabase } from './supabaseClient'; // Yeni eklediğimiz istemci

const APP_VERSION = 'v1.1.0-PRO';
// Buraya Railway'deki Python uygulamanın linkini yapıştıracaksın:
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeStock, setActiveStock] = useState(null);
  
  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [stocks, setStocks] = useState([]);

  // Supabase Oturum Kontrolü
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError('Hatalı e-posta veya şifre');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthError('Kayıt sırasında hata oluştu');
    else alert('Kayıt başarılı! E-postanı kontrol et (varsa onay linki için).');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Stok Verilerini Çekme (Netlify Function'dan)
  const fetchStockData = async (symbol) => {
    try {
      const res = await fetch(`/.netlify/functions/get-stock?symbol=${symbol}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Veri çekilemedi:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    // Başlangıçta örnek birkaç hisse çekelim
    ["THYAO", "KCHOL", "GARAN"].forEach(async (s) => {
        const data = await fetchStockData(s);
        if (data) setStocks(prev => [...prev.filter(x => x.symbol !== s), data]);
    });
  }, [isLoggedIn]);

  if (loading) return <div className="loading-state">PhD Sistemleri Yükleniyor...</div>;

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="logo" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            PhD TERMİNAL <span style={{fontSize:'10px'}}>PRO</span>
          </div>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>E-posta</label>
              <input type="email" className="search-bar" style={{ width: '100%' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Şifre</label>
              <input type="password" className="search-bar" style={{ width: '100%' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {authError && <p style={{ color: 'var(--loss-color)', marginTop: '0.5rem' }}>{authError}</p>}
            <button type="submit" className="login-btn">Giriş Yap</button>
            <button type="button" onClick={handleRegister} className="login-btn" style={{background:'transparent', border:'1px solid var(--accent-color)', marginTop:'10px'}}>Kayıt Ol</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">PhD <span>TERMINAL</span></div>
        <nav>
          <ul className="nav-links">
            <li className={`nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('Dashboard')}>Dashboard</li>
            <li className="nav-item" onClick={handleLogout}>🚪 Güvenli Çıkış</li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header>
          <h1>Hoş geldin, {user.email.split('@')[0]}</h1>
          <div className="badge">{APP_VERSION}</div>
        </header>

        <div className="dashboard-grid">
          {stocks.map(stock => (
            <div key={stock.symbol} className="stock-card" onClick={() => setActiveStock(stock.symbol)}>
               <h3>{stock.symbol}</h3>
               <p>{stock.name}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
