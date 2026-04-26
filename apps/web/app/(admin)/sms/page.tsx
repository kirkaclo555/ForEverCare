"use client";

import React, { useState } from 'react';
import './sms.css';

export default function SMSCenterPage() {
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');

  const fillTemplate = (text: string) => {
    setMessage(text);
  };

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)' }}>
            <i className="fas fa-paper-plane"></i>
          </div>
          <div className="stat-info">
            <h3>Total Sent</h3>
            <p>4,250</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>Delivered</h3>
            <p>4,180</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dd6b20 0%, #c05621 100%)' }}>
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>Pending</h3>
            <p>45</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h3>Failed</h3>
            <p>25</p>
          </div>
        </div>
      </div>

      <div className="sms-layout">
        {/* Left Column */}
        <div>
          <div className="compose-card" style={{ marginBottom: '25px' }}>
            <div className="card-header">
              <h3><i className="fas fa-pen-alt"></i> Compose Message</h3>
              <span className="character-count">{message.length}/160</span>
            </div>

            <div className="recipient-section">
              <label className="recipient-label"><i className="fas fa-user"></i> Recipient</label>
              <div className="recipient-input-group">
                <input 
                  type="text" 
                  className="recipient-input" 
                  placeholder="Enter phone number or select contact..." 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                <button className="select-contact-btn" title="Select Contact">
                  <i className="fas fa-address-book"></i>
                </button>
              </div>
            </div>

            <div className="message-input-group">
              <label className="message-label"><i className="fas fa-comment-alt"></i> Message</label>
              <textarea 
                className="message-input" 
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="send-options">
              <label className="schedule-check">
                <input type="checkbox" />
                <span>Schedule for later</span>
              </label>
            </div>

            <button className="send-now-btn">
              <i className="fas fa-paper-plane"></i> Send Message
            </button>
          </div>

          <div className="history-card" style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ color: '#2d3748', fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-history" style={{ color: '#2E5E3E' }}></i> Recent History
              </h3>
              <span style={{ color: '#2E5E3E', fontSize: '0.9rem', cursor: 'pointer' }}>View All</span>
            </div>

            <div className="message-list">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '15px 0', borderBottom: '1px solid #edf2f7' }}>
                <div style={{ width: '40px', height: '40px', background: '#e6fffa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38a169', flexShrink: 0 }}>
                  <i className="fas fa-check"></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: '#2d3748', fontWeight: 600, fontSize: '0.95rem' }}>John Doe</span>
                    <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>10:30 AM</span>
                  </div>
                  <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '5px' }}>Hi John! Max's appointment is confirmed for tomorrow...</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '15px 0', borderBottom: '1px solid #edf2f7' }}>
                <div style={{ width: '40px', height: '40px', background: '#ebf8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3182ce', flexShrink: 0 }}>
                  <i className="fas fa-clock"></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: '#2d3748', fontWeight: 600, fontSize: '0.95rem' }}>Sarah Smith</span>
                    <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>Pending</span>
                  </div>
                  <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '5px' }}>Reminder: Luna needs her annual vaccination next week...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="templates-card" style={{ marginBottom: '25px' }}>
            <div className="templates-header">
              <h3><i className="fas fa-layer-group"></i> Quick Templates</h3>
              <button className="add-template-btn"><i className="fas fa-plus"></i></button>
            </div>

            <div className="template-search">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search templates..." style={{ width: '100%', padding: '10px 15px 10px 40px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem' }} />
            </div>

            <div className="template-list">
              <div 
                className="template-item" 
                style={{ padding: '15px', border: '1px solid #edf2f7', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                onClick={() => fillTemplate("Hi [Name]! This is a reminder for [Pet Name]'s appointment tomorrow at [Time]. Please reply YES to confirm.")}
              >
                <div style={{ color: '#2d3748', fontWeight: 600, fontSize: '0.95rem', marginBottom: '5px' }}>Appointment Reminder</div>
                <div style={{ color: '#718096', fontSize: '0.85rem' }}>Hi [Name]! This is a reminder for [Pet Name]'s appointment tomorrow at [Time]...</div>
              </div>

              <div 
                className="template-item" 
                style={{ padding: '15px', border: '1px solid #edf2f7', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                onClick={() => fillTemplate("Hello! Great news, [Pet Name]'s test results are ready. You can view them on the portal or call us.")}
              >
                <div style={{ color: '#2d3748', fontWeight: 600, fontSize: '0.95rem', marginBottom: '5px' }}>Test Results Ready</div>
                <div style={{ color: '#718096', fontSize: '0.85rem' }}>Hello! Great news, [Pet Name]'s test results are ready...</div>
              </div>

              <div 
                className="template-item" 
                style={{ padding: '15px', border: '1px solid #edf2f7', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                onClick={() => fillTemplate("Hi [Name], it's time for [Pet Name]'s annual vaccination! Please call us to schedule an appointment.")}
              >
                <div style={{ color: '#2d3748', fontWeight: 600, fontSize: '0.95rem', marginBottom: '5px' }}>Vaccination Due</div>
                <div style={{ color: '#718096', fontSize: '0.85rem' }}>Hi [Name], it's time for [Pet Name]'s annual vaccination...</div>
              </div>
            </div>
          </div>

          <div className="contact-card" style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)' }}>
            <h3 style={{ color: '#2d3748', fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <i className="fas fa-address-book" style={{ color: '#2E5E3E' }}></i> Recent Contacts
            </h3>
            
            <div className="contact-list">
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}
                onClick={() => setRecipient("+1 (555) 123-4567")}
              >
                <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #2E5E3E 0%, #2E5E3E 100%)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>JD</div>
                <div>
                  <div style={{ color: '#2d3748', fontWeight: 600, fontSize: '0.95rem' }}>John Doe</div>
                  <div style={{ color: '#a0aec0', fontSize: '0.8rem' }}>Max (Dog)</div>
                </div>
              </div>

              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}
                onClick={() => setRecipient("+1 (555) 987-6543")}
              >
                <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>SS</div>
                <div>
                  <div style={{ color: '#2d3748', fontWeight: 600, fontSize: '0.95rem' }}>Sarah Smith</div>
                  <div style={{ color: '#a0aec0', fontSize: '0.8rem' }}>Luna (Cat)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
