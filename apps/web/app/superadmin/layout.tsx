"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import '../admin/admin.css'; // Reuse global admin styles

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`main-content ${sidebarOpen ? 'shifted' : ''}`} id="mainContent">
        <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        {children}
      </div>
    </>
  );
}
