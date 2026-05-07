"use client";

import React, { useState } from 'react';
import './welcome.css';

export default function WelcomePage() {
  return (
    <>
      
    
    <div className="background-container">
        <div className="clinic-slider">
            <div className="clinic-slide slide1"></div>
            <div className="clinic-slide slide2"></div>
            <div className="clinic-slide slide3"></div>
            <div className="clinic-slide slide4"></div>
            <div className="clinic-slide slide5"></div>
        </div>
    </div>

    
    <div className="overlay"></div>

    
    <div className="welcome-container">
        
        <div className="brand-section">
            <div className="logo">
                <i className="fas fa-paw"></i>
            </div>
            <h1 className="brand-title">FurEverCare</h1>
            <p className="brand-subtitle">Veterinary Management System</p>
        </div>

        
        <div className="welcome-message">
            <h2>Welcome to Your Pet's Healthcare Hub</h2>
            <p>Experience seamless veterinary care management with our comprehensive platform. Book appointments, access pet records, and connect with our veterinary team - all in one place.</p>
        </div>

        
        <div className="action-buttons">
            <a href="#" className="btn-primary" onClick={() => console.log('downloadApp(event)')}>
                <i className="fas fa-download"></i>
                Download Our App Now
            </a>
            
            <div className="app-buttons">
                <a href="#" className="app-btn" onClick={() => console.log('downloadForIOS(event)')}>
                    <i className="fab fa-apple"></i>
                    iOS
                </a>
                <a href="#" className="app-btn" onClick={() => console.log('downloadForAndroid(event)')}>
                    <i className="fab fa-google-play"></i>
                    Android
                </a>
            </div>
        </div>

        
        <div className="login-section">
            <a href="Loginpage.html" className="login-link">
                <i className="fas fa-sign-in-alt"></i>
                Login
            </a>
        </div>
    </div>

    

    </>
  );
}
