"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { LanguageProvider } from '../../context/LanguageContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { AdminProfileProvider } from '../../context/AdminProfileContext';
import './admin.css'; // Global admin styles migrated from HTML

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <LanguageProvider>
      <NotificationProvider>
        <AdminProfileProvider>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className={`main-content ${sidebarOpen ? 'shifted' : ''}`} id="mainContent">
            <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            {children}
          </div>
        </AdminProfileProvider>
      </NotificationProvider>
    </LanguageProvider>
  );
}
