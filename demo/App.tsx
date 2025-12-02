import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import BasicPlaygroundPage from './pages/BasicPlaygroundPage';
import CustomCustomizerPage from './pages/CustomCustomizerPage';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '16px 24px',
            background: '#050816',
            color: '#fff',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 20 }}>OpenSCAD Component Demo</h1>
            <p style={{ margin: '4px 0 0', color: '#96a3d3' }}>
              Explore built-in functionality and a fully custom customizer panel.
            </p>
          </div>
          <nav style={{ display: 'flex', gap: 12 }}>
            <NavLink to="/basic" style={navLinkStyle}>
              {({ isActive }) => <span style={navLinkInnerStyle(isActive)}>Built-in Customizer</span>}
            </NavLink>
            <NavLink to="/custom-customizer" style={navLinkStyle}>
              {({ isActive }) => <span style={navLinkInnerStyle(isActive)}>Custom Customizer Panel</span>}
            </NavLink>
          </nav>
        </header>

        <main style={{ flex: 1, minHeight: 0 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/basic" replace />} />
            <Route path="/basic" element={<BasicPlaygroundPage />} />
            <Route path="/custom-customizer" element={<CustomCustomizerPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

const navLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
};

const navLinkInnerStyle = (isActive: boolean): React.CSSProperties => ({
  padding: '6px 14px',
  borderRadius: 999,
  border: `1px solid ${isActive ? '#7dd3fc' : '#2b3952'}`,
  color: isActive ? '#fff' : '#a3b3d9',
  background: isActive ? '#0ea5e9' : 'transparent',
  fontSize: 14,
});

export default App;
