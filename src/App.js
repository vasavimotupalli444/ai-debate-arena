import React, { useState, useEffect } from 'react';
import DebateApp from './components/DebateApp';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    // Check if redirected back from Google login
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userData = params.get('user');

    if (token && userData) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userData);
      // Clean URL
      window.history.replaceState({}, document.title, '/');
    }

    // Load saved user
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(decodeURIComponent(savedUser)));
      } catch {
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);

  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowHistory(false);
    setHistory([]);
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/debates/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setHistory([]);
    }
    setLoadingHistory(false);
    setShowHistory(true);
  };

  // Login Screen
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a, #7c3aed)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '50px 40px',
          borderRadius: '24px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          maxWidth: '420px',
          width: '90%',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🏆</div>
          <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '8px', margin: '0 0 8px 0' }}>
            AI Debate Arena
          </h1>
          <p style={{ color: '#93c5fd', marginBottom: '30px', fontSize: '15px' }}>
            Challenge AI in intelligent debates & track your progress
          </p>

          <button onClick={handleLogin} style={{
            background: 'white',
            color: '#1e3a8a',
            border: 'none',
            padding: '14px 32px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '0 auto',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s'
          }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img src="https://www.google.com/favicon.ico" width="20" alt="G" />
            Continue with Google
          </button>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '24px' }}>
            Your debate history will be saved automatically
          </p>
        </div>
      </div>
    );
  }

  // Main App (logged in)
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Top Navigation Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user.avatar ? (
            <img src={user.avatar} width="32" height="32"
              style={{ borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)' }}
              alt="avatar"
            />
          ) : (
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#7c3aed', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: 'bold'
            }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
            {user.name}
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchHistory} style={{
            background: 'rgba(124, 58, 237, 0.4)',
            color: 'white', border: '1px solid rgba(124,58,237,0.6)',
            padding: '7px 16px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '13px', fontWeight: '500'
          }}>
            📜 My History
          </button>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white', border: '1px solid rgba(255,255,255,0.2)',
            padding: '7px 16px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '13px'
          }}>
            Logout
          </button>
        </div>
      </div>

      {/* Debate App with top padding */}
      <div style={{ paddingTop: '52px' }}>
        <DebateApp user={user} />
      </div>

      {/* History Modal */}
      {showHistory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowHistory(false); }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
            borderRadius: '24px', padding: '30px',
            maxWidth: '620px', width: '100%',
            maxHeight: '80vh', overflowY: 'auto',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '1.5rem' }}>📜 Debate History</h2>
                <p style={{ color: '#93c5fd', margin: 0, fontSize: '13px' }}>
                  {history.length} debate{history.length !== 1 ? 's' : ''} saved
                </p>
              </div>
              <button onClick={() => setShowHistory(false)} style={{
                background: 'rgba(255,255,255,0.1)', color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px', padding: '8px 14px',
                cursor: 'pointer', fontSize: '14px'
              }}>✕ Close</button>
            </div>

            {/* Loading */}
            {loadingHistory && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#93c5fd' }}>
                Loading your debates...
              </div>
            )}

            {/* Empty state */}
            {!loadingHistory && history.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎯</div>
                <p style={{ color: '#93c5fd', fontSize: '16px' }}>No debates saved yet!</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                  Complete a debate (let the timer run out) to save it here.
                </p>
              </div>
            )}

            {/* Debate List */}
            {!loadingHistory && history.map((debate, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '16px 18px',
                marginBottom: '12px',
                border: `1px solid ${
                  debate.winner === 'human' ? 'rgba(74,222,128,0.3)' :
                  debate.winner === 'ai' ? 'rgba(192,132,252,0.3)' :
                  'rgba(251,191,36,0.3)'
                }`
              }}>
                {/* Topic + Winner */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{ color: 'white', fontWeight: '600', fontSize: '14px', flex: 1, marginRight: '10px' }}>
                    {debate.topic}
                  </span>
                  <span style={{
                    color: debate.winner === 'human' ? '#4ade80' :
                           debate.winner === 'ai' ? '#c084fc' : '#fbbf24',
                    fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap',
                    background: debate.winner === 'human' ? 'rgba(74,222,128,0.15)' :
                                debate.winner === 'ai' ? 'rgba(192,132,252,0.15)' : 'rgba(251,191,36,0.15)',
                    padding: '3px 10px', borderRadius: '20px'
                  }}>
                    {debate.winner === 'human' ? '🏆 You Won' :
                     debate.winner === 'ai' ? '🤖 AI Won' : '🤝 Tie'}
                  </span>
                </div>

                {/* Scores + Info */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#4ade80', fontSize: '13px' }}>
                    You: <strong>{debate.humanScore}</strong>
                  </span>
                  <span style={{ color: '#c084fc', fontSize: '13px' }}>
                    AI: <strong>{debate.aiScore}</strong>
                  </span>
                  <span style={{ color: '#93c5fd', fontSize: '13px' }}>
                    {debate.userLevel}
                  </span>
                  <span style={{ color: '#93c5fd', fontSize: '13px' }}>
                    {debate.debateMode} mode
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginLeft: 'auto' }}>
                    {new Date(debate.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;