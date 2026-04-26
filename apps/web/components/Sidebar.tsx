"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fa-home' },
    { name: 'Inventory', path: '/inventory', icon: 'fa-boxes' },
    { name: 'Store', path: '/store', icon: 'fa-store' },
    { name: 'Billing', path: '/billing', icon: 'fa-file-invoice-dollar' },
    { name: 'Appointment', path: '/appointment', icon: 'fa-calendar-check' },
    { name: 'Teleconsultation', path: '/teleconsultation', icon: 'fa-video' },
    { name: 'SMS Center', path: '/sms', icon: 'fa-sms' },
    { name: 'Patient Records', path: '/records', icon: 'fa-paw' },
    { name: 'Users', path: '/users', icon: 'fa-users' },
    { name: 'Archive', path: '/archive', icon: 'fa-archive' },
    { name: 'Reports', path: '/reports', icon: 'fa-chart-bar' },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'active' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <h2>
          FurEverCare
          <span>Veterinary System</span>
        </h2>
        <button className="close-sidebar" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (pathname === '/' && item.path === '/dashboard');
          return (
            <Link 
              key={item.path}
              href={item.path}
              className={`menu-item ${isActive ? 'active' : ''}`}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
