import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fb' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f6f8fb',
        overflowX: 'hidden',
        width: '100%',
      }}>
        <Header />
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: '100%',
          maxWidth: 'calc(100vw - 220px - 48px)',
          margin: '0 auto',
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
