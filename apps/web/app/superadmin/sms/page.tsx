"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './sms.css';

export default function SmsPage() {
  const router = useRouter();
  
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const templates = [
    { id: 1, title: 'Appointment Reminder', text: 'Hi [Name], this is a reminder for your pet\'s appointment tomorrow at FurEverCare.' },
    { id: 2, title: 'Vaccination Due', text: 'Hello! It\'s time for your pet\'s annual vaccination. Please schedule an appointment soon.' },
    { id: 3, title: 'Check-up Follow-up', text: 'Hi! Just checking in on how your pet is doing after their recent visit to FurEverCare.' },
    { id: 4, title: 'Promotion', text: 'Special offer! Get 20% off all grooming services this weekend at FurEverCare.' },
  ];

  const fetchSmsData = async () => {
    try {
      const res = await fetch('/api/sms');
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        setContacts(data.contacts);
      }
    } catch (err) {
      console.error('Failed to load SMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmsData();
  }, []);

  const handleSendSms = async () => {
    if (!recipientPhone.trim() || !message.trim()) {
      setFormError('Please enter a recipient phone number and a message.');
      return;
    }
    setFormError('');

    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientPhone,
          message: message
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Successfully sent a message!');
        setMessage('');
        setRecipientPhone('');
        setIsComposeOpen(false);
        fetchSmsData();
      } else {
        setFormError('Failed to send SMS: ' + data.error);
      }
    } catch (err: any) {
      setFormError('Error sending SMS: ' + err.message);
    }
  };

  const handleSendReply = async (toPhone: string, text: string) => {
    if (!text.trim()) return;
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toPhone,
          message: text
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Successfully sent reply!');
        setReplyText('');
        setSelectedMessage(null);
        setSelectedContact(null);
        fetchSmsData();
      } else {
        alert('Failed to send Reply: ' + data.error);
      }
    } catch (err: any) {
      alert('Error sending reply: ' + err.message);
    }
  };

  const [isAllMessagesOpen, setIsAllMessagesOpen] = useState(false);
  const [isAllContactsOpen, setIsAllContactsOpen] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  return (
    <>
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} >
        
        <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
            <button 
                onClick={() => setIsComposeOpen(!isComposeOpen)}
                style={{ background: 'linear-gradient(135deg, #2E5E3E 0%, #1a4d2e 100%)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(46, 94, 62, 0.2)' }}
            >
                <i className="fas fa-edit"></i> {isComposeOpen ? 'Close Compose' : 'Compose Message'}
            </button>
        </div>

        {isComposeOpen && (
        <div className="sms-layout">
            <div className="compose-card">
                <div className="card-header">
                    <h3>
                        <i className="fas fa-edit"></i>
                        Compose Message
                    </h3>
                    <span className="character-count">{message.length}/160</span>
                </div>

                {formError && (
                    <div style={{ background: '#fff5f5', color: '#c53030', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fed7d7', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: '500', animation: 'modalFadeIn 0.2s ease-out' }}>
                        <i className="fas fa-exclamation-circle" style={{ fontSize: '1.1rem' }}></i> {formError}
                    </div>
                )}

                <div className="recipient-section">
                    <div className="recipient-label">
                        <i className="fas fa-user"></i>
                        <span>To:</span>
                    </div>
                    <div className="recipient-input-group">
                        <input type="text" className="recipient-input" id="recipient" placeholder="Enter phone number" value={recipientPhone} onChange={(e) => { setRecipientPhone(e.target.value); setFormError(''); }} />
                        <button className="select-contact-btn" onClick={() => setIsAllContactsOpen(true)}>
                            <i className="fas fa-address-book"></i>
                        </button>
                    </div>
                    <div id="selectedContactsList" style={{"marginTop":"10px","display":"flex","flexWrap":"wrap","gap":"8px"}}></div>
                </div>

                <div className="message-input-group">
                    <div className="message-label">
                        <i className="fas fa-comment"></i>
                        <span>Message:</span>
                    </div>
                    <textarea className="message-input" id="message" placeholder="Type your message here..." maxLength={160} value={message} onChange={(e) => { setMessage(e.target.value); setFormError(''); }}></textarea>
                </div>

                <div className="send-options">
                    <label className="schedule-check">
                        <input type="checkbox" id="schedule" />
                        <span>Schedule for later</span>
                    </label>
                    <button className="send-now-btn" onClick={handleSendSms}>
                        <i className="fas fa-paper-plane"></i>
                        Send Now
                    </button>
                </div>
            </div>

            <div className="templates-card">
                <div className="templates-header">
                    <h3>
                        <i className="fas fa-file-alt"></i>
                        Templates
                    </h3>
                    <button className="add-template-btn" onClick={() => alert('Add template clicked')}>
                        <i className="fas fa-plus"></i>
                    </button>
                </div>

                <div className="template-search">
                    <i className="fas fa-search"></i>
                    <input type="text" id="templateSearch" placeholder="Search templates..." />
                </div>

                <div className="templates-list" id="templatesList">
                    {templates.map(template => (
                        <div key={template.id} onClick={() => setMessage(template.text)} style={{ padding: '15px', borderBottom: '1px solid #edf2f7', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <h4 style={{ margin: '0 0 5px 0', color: '#2d3748', fontSize: '0.95rem' }}>{template.title}</h4>
                            <p style={{ margin: 0, color: '#718096', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{template.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        )}

        {/* 2-Column Format Container */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '25px' }}>
            <div className="history-card" style={{ gridColumn: 'unset', margin: 0 }}>
                <div className="history-header">
                    <h3>
                        <i className="fas fa-history"></i>
                        Recent Messages
                    </h3>
                    <span className="view-all" onClick={() => setIsAllMessagesOpen(true)}>View All</span>
                </div>

                <div className="messages-list">
                    {messages.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>No messages sent yet.</div>
                    ) : (
                        messages.slice(0, 3).map(msg => (
                            <div className="message-item" key={msg.id} onClick={() => setSelectedMessage(msg)} style={{ cursor: 'pointer', transition: 'background-color 0.2s', borderRadius: '8px', padding: '10px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <div className="message-avatar"><i className="fas fa-user"></i></div>
                                <div className="message-content">
                                    <div className="message-header">
                                        <span className="message-sender">{msg.to}</span>
                                        <span className="message-time">{msg.time}</span>
                                    </div>
                                    <div className="message-preview">{msg.preview}</div>
                                    <div className="message-status">
                                        <span className={`status-badge status-${msg.status.toLowerCase()}`}>{msg.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="contacts-card" style={{ gridColumn: 'unset', margin: 0 }}>
                <div className="contacts-header">
                    <h3>
                        <i className="fas fa-address-book"></i>
                        Recent Contacts
                    </h3>
                    <span className="view-all" onClick={() => setIsAllContactsOpen(true)}>View All Contacts</span>
                </div>

                <div className="contacts-grid">
                    {contacts.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>No contacts found.</div>
                    ) : (
                        contacts.slice(0, 4).map(contact => (
                            <div className="contact-item" key={contact.id} onClick={() => setSelectedContact(contact)} style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                                <div className="contact-avatar"><i className="fas fa-user"></i></div>
                                <div className="contact-info">
                                    <div className="contact-name">{contact.name}</div>
                                    <div className="contact-number">{contact.phone}</div>
                                    <div className="contact-role">Pet: {contact.pet}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    </div>

    {/* View All Messages Modal */}
    {isAllMessagesOpen && (
    <div className="modal show" onClick={(e) => { if(e.target === e.currentTarget) setIsAllMessagesOpen(false) }}>
        <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
                <h3><i className="fas fa-history" style={{ marginRight: '10px', color: '#2E5E3E' }}></i> All Messages</h3>
                <button className="modal-close" onClick={() => setIsAllMessagesOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
                <div className="messages-list" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '25px' }}>
                    {messages.map(msg => (
                        <div className="message-item" key={msg.id} onClick={() => { setSelectedMessage(msg); setIsAllMessagesOpen(false); }} style={{ borderBottom: '1px solid #edf2f7', padding: '15px', cursor: 'pointer', transition: 'background-color 0.2s', borderRadius: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <div className="message-avatar"><i className="fas fa-user"></i></div>
                            <div className="message-content">
                                <div className="message-header">
                                    <span className="message-sender">{msg.to}</span>
                                    <span className="message-time">{msg.time}</span>
                                </div>
                                <div className="message-preview">{msg.preview}</div>
                                <div className="message-status">
                                    <span className={`status-badge status-${msg.status.toLowerCase()}`}>{msg.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
    )}

    {/* View All Contacts Modal */}
    {isAllContactsOpen && (
    <div className="modal show" onClick={(e) => { if(e.target === e.currentTarget) setIsAllContactsOpen(false) }}>
        <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
                <h3><i className="fas fa-address-book" style={{ marginRight: '10px', color: '#2E5E3E' }}></i> All Contacts</h3>
                <button className="modal-close" onClick={() => setIsAllContactsOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <div className="template-search" style={{ marginBottom: '20px' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}></i>
                    <input type="text" placeholder="Search contacts..." style={{ width: '100%', padding: '10px 10px 10px 40px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem' }} />
                </div>
                <div className="contacts-grid" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    {contacts.map(contact => (
                        <div className="contact-item" key={contact.id} onClick={() => { 
                            setRecipientPhone(contact.phone); 
                            setIsComposeOpen(true); 
                            setIsAllContactsOpen(false); 
                        }} style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                            <div className="contact-avatar"><i className="fas fa-user"></i></div>
                            <div className="contact-info">
                                <div className="contact-name">{contact.name}</div>
                                <div className="contact-number">{contact.phone}</div>
                                <div className="contact-role">Pet: {contact.pet}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
    )}

    {/* Message Details & Reply Modal */}
    {selectedMessage && (
    <div className="modal show" onClick={(e) => { if(e.target === e.currentTarget) setSelectedMessage(null) }}>
        <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
                <h3><i className="fas fa-comment-dots" style={{ marginRight: '10px', color: '#2E5E3E' }}></i> Message Details</h3>
                <button className="modal-close" onClick={() => { setSelectedMessage(null); setReplyText(''); }}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#718096' }}><strong>To:</strong> {selectedMessage.to}</p>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#718096' }}><strong>Time:</strong> {selectedMessage.time}</p>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#718096' }}><strong>Status:</strong> <span className={`status-badge status-${selectedMessage.status.toLowerCase()}`}>{selectedMessage.status}</span></p>
                    <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #edf2f7', marginTop: '10px' }}>
                        {selectedMessage.preview}
                    </div>
                </div>
                
                <div className="message-input-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: 600 }}>Reply:</label>
                    <textarea 
                        className="message-input" 
                        placeholder="Type your reply here..." 
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)}
                        style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', resize: 'vertical' }}
                    ></textarea>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => { setSelectedMessage(null); setReplyText(''); }}>Cancel</button>
                <button className="btn btn-primary" onClick={() => handleSendReply(selectedMessage.to, replyText)} disabled={!replyText.trim()} style={{ opacity: !replyText.trim() ? 0.5 : 1 }}><i className="fas fa-paper-plane" style={{ marginRight: '8px' }}></i>Send Reply</button>
            </div>
        </div>
    </div>
    )}

    {/* Contact Message Modal */}
    {selectedContact && (
    <div className="modal show" onClick={(e) => { if(e.target === e.currentTarget) setSelectedContact(null) }}>
        <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
                <h3><i className="fas fa-user" style={{ marginRight: '10px', color: '#2E5E3E' }}></i> Message {selectedContact.name}</h3>
                <button className="modal-close" onClick={() => { setSelectedContact(null); setReplyText(''); }}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#718096' }}><strong>Phone:</strong> {selectedContact.phone}</p>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#718096' }}><strong>Pet:</strong> {selectedContact.pet}</p>
                </div>
                
                <div className="message-input-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: 600 }}>Message:</label>
                    <textarea 
                        className="message-input" 
                        placeholder={`Type your message to ${selectedContact.name}...`}
                        value={replyText} 
                        onChange={(e) => setReplyText(e.target.value)}
                        style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '12px', border: '2px solid #e2e8f0', resize: 'vertical' }}
                    ></textarea>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => { setSelectedContact(null); setReplyText(''); }}>Cancel</button>
                <button className="btn btn-primary" onClick={() => handleSendReply(selectedContact.phone, replyText)} disabled={!replyText.trim()} style={{ opacity: !replyText.trim() ? 0.5 : 1 }}><i className="fas fa-paper-plane" style={{ marginRight: '8px' }}></i>Send Message</button>
            </div>
        </div>
    </div>
    )}

    {/* Success Modal */}
    {successMessage && (
        <div className="modal show" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000}}>
            <div className="modal-content" style={{background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#C6F6D5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <i className="fas fa-check" style={{ color: '#2E5E3E', fontSize: '2rem' }}></i>
                </div>
                <h3 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: '1.4rem' }}>Success!</h3>
                <p style={{ color: '#718096', marginBottom: '25px', lineHeight: '1.5' }}>{successMessage}</p>
                <button onClick={() => setSuccessMessage('')} style={{ padding: '10px 30px', background: '#2E5E3E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', width: '100%' }}>OK</button>
            </div>
        </div>
    )}

    </>
  );
}
