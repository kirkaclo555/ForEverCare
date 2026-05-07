"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../../hooks/useNotifications';
import './monitor.css';

type Sender = 'owner' | 'system' | 'admin';

interface Message {
  id: string;
  sender: Sender;
  text: string;
  time: string;
  isUrgent?: boolean;
}

interface Session {
  id: string;
  ownerName: string;
  petName: string;
  breed: string;
  status: 'diagnosing' | 'attention' | 'resolved';
  messages: Message[];
}

const mockSessions: Session[] = [
  {
    id: 's1',
    ownerName: 'Sarah Jenkins',
    petName: 'Max',
    breed: 'Golden Retriever',
    status: 'diagnosing',
    messages: [
      { id: 'm1', sender: 'owner', text: 'Hi, Max has been very lethargic since yesterday and refused to eat his breakfast.', time: '10:30 AM' },
      { id: 'm2', sender: 'system', text: 'I understand. Let\'s get some more details. Can you confirm Max\'s breed and age?', time: '10:30 AM' },
      { id: 'm3', sender: 'owner', text: 'He is a Golden Retriever, 4 years old.', time: '10:31 AM' },
      { id: 'm4', sender: 'system', text: 'Thank you. Have you noticed any other symptoms like vomiting, diarrhea, or excessive panting?', time: '10:31 AM' },
      { id: 'm5', sender: 'owner', text: 'Yes, he threw up once last night. No diarrhea though.', time: '10:32 AM' },
      { id: 'm6', sender: 'system', text: 'Noted. Lethargy combined with vomiting can be concerning in Golden Retrievers. Is his abdomen sensitive to touch?', time: '10:33 AM' }
    ]
  },
  {
    id: 's2',
    ownerName: 'Michael Chang',
    petName: 'Luna',
    breed: 'Siamese Cat',
    status: 'attention',
    messages: [
      { id: 'm1', sender: 'owner', text: 'Luna is scratching her ears constantly.', time: '09:15 AM' },
      { id: 'm2', sender: 'system', text: 'Is there any visible redness, discharge, or bad odor coming from the ears?', time: '09:15 AM' },
      { id: 'm3', sender: 'owner', text: 'Yes, it looks like dark brown coffee grounds inside.', time: '09:18 AM' },
      { id: 'm4', sender: 'system', text: 'Dark brown debris resembling coffee grounds is a classic sign of ear mites. This requires veterinary attention to confirm and prescribe ear drops.', time: '09:18 AM' },
      { id: 'm5', sender: 'owner', text: 'Okay, should I bring her in today?', time: '09:20 AM' }
    ]
  },
  {
    id: 's3',
    ownerName: 'Emily Davis',
    petName: 'Bella',
    breed: 'French Bulldog',
    status: 'resolved',
    messages: [
      { id: 'm1', sender: 'owner', text: 'Bella has a mild rash on her belly.', time: 'Yesterday' },
      { id: 'm2', sender: 'system', text: 'How long has the rash been there? Has she been exposed to new grass or plants?', time: 'Yesterday' },
      { id: 'm3', sender: 'owner', text: 'Just noticed it today after we went to the park.', time: 'Yesterday' },
      { id: 'm4', sender: 'system', text: 'It might be contact dermatitis. You can gently wash the area with hypoallergenic pet shampoo. Monitor it for 24 hours.', time: 'Yesterday' }
    ]
  }
];

export default function PetMonitorPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>('s1');
  const [takeoverMode, setTakeoverMode] = useState<boolean>(false);
  const [showAdmissionModal, setShowAdmissionModal] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState('');
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0]!;

  useEffect(() => {
    // Scroll to bottom of chat when new message arrives or session changes
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [activeSession.messages, activeSessionId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: takeoverMode ? 'admin' : 'system',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: [...s.messages, newMessage] };
      }
      return s;
    }));
    
    setChatInput('');
  };

  const confirmRecommendAdmission = () => {
    const urgentMessage: Message = {
      id: Date.now().toString(),
      sender: 'admin',
      text: "URGENT MEDICAL ADVICE: Based on the symptoms described, please bring " + activeSession.petName + " to the clinic immediately for an emergency examination. An SMS alert has been sent to your registered phone number.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUrgent: true
    };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, status: 'attention', messages: [...s.messages, urgentMessage] };
      }
      return s;
    }));

    // Simulate SMS toast
    addNotification('Urgent Admission Recommended', `SMS sent to ${activeSession.ownerName} for ${activeSession.petName}.`, 'fas fa-ambulance');
    const toast = document.getElementById('toast');
    if (toast) {
      toast.innerHTML = `<i class="fas fa-sms"></i> SMS alert successfully sent to ${activeSession.ownerName}.`;
      toast.className = 'toast show';
      setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
    }

    setShowAdmissionModal(false);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'diagnosing': return 'System Diagnosing';
      case 'attention': return 'Requires Attention';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  return (
    <>
      <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }}>
        <div style={{ padding: '20px', paddingBottom: '10px' }}>
          <h1 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
            <i className="fas fa-heartbeat" style={{ color: '#2E5E3E' }}></i> Pet Monitor & Diagnostics
          </h1>
          <p style={{ color: '#718096', margin: '5px 0 0 0' }}>Oversee automated AI pet diagnostics and intervene when necessary.</p>
        </div>

        <div style={{ padding: '0 20px 20px 20px' }}>
          <div className="monitor-container">
            {/* Sidebar List */}
            <div className="monitor-sidebar">
              <div className="monitor-sidebar-header">
                <h3><i className="fas fa-list-ul"></i> Active Sessions</h3>
              </div>
              <div className="pet-list">
                {sessions.map(session => (
                  <div 
                    key={session.id} 
                    className={`pet-item ${activeSessionId === session.id ? 'active' : ''}`}
                    onClick={() => { setActiveSessionId(session.id); setTakeoverMode(false); }}
                  >
                    <div className="pet-avatar">
                      {session.petName.charAt(0)}
                    </div>
                    <div className="pet-info">
                      <h4>{session.petName} ({session.breed})</h4>
                      <p>{session.ownerName}</p>
                      <span className={`status-indicator ${session.status}`}>
                        {getStatusLabel(session.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="monitor-chat-area">
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="pet-avatar" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                    {activeSession.petName.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#2d3748' }}>{activeSession.petName} <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 'normal' }}>• {activeSession.ownerName}</span></h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>Diagnostic flow in progress</p>
                  </div>
                </div>
                <div className="chat-actions">
                  <div className="takeover-toggle">
                    <span>Takeover Chat</span>
                    <label className="switch">
                      <input type="checkbox" checked={takeoverMode} onChange={(e) => setTakeoverMode(e.target.checked)} />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <button className="btn-urgent" onClick={() => setShowAdmissionModal(true)}>
                    <i className="fas fa-ambulance"></i> Recommend Admission
                  </button>
                </div>
              </div>

              <div className="chat-messages" ref={chatMessagesRef}>
                <div style={{ textAlign: 'center', margin: '10px 0' }}>
                  <span style={{ background: '#edf2f7', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', color: '#718096' }}>Chat Started</span>
                </div>
                
                {activeSession.messages.map(msg => (
                  <div key={msg.id} className={`message ${msg.sender} ${msg.isUrgent ? 'urgent' : ''}`}>
                    <div className="message-bubble">
                      {msg.isUrgent && <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>}
                      {msg.text}
                    </div>
                    <div className="message-meta">
                      {msg.sender === 'owner' ? activeSession.ownerName : (msg.sender === 'system' ? 'Automated System' : 'Veterinarian')} • {msg.time}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input-area">
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                  <input 
                    type="text" 
                    placeholder={takeoverMode ? "Type manual diagnosis or question..." : "Enable 'Takeover Chat' to type messages manually"} 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={!takeoverMode}
                  />
                  <button type="submit" disabled={!takeoverMode || !chatInput.trim()}>
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAdmissionModal && (
        <div className="monitor-modal-overlay">
          <div className="monitor-modal-content">
            <div className="monitor-modal-header">
              <h3><i className="fas fa-exclamation-triangle" style={{ color: '#e53e3e', marginRight: '10px' }}></i> Urgent Admission</h3>
            </div>
            <div className="monitor-modal-body">
              <p>Are you sure you want to send an urgent admission SMS to <strong>{activeSession.ownerName}</strong> for <strong>{activeSession.petName}</strong>?</p>
              <p style={{ fontSize: '0.85rem', color: '#718096', marginTop: '10px' }}>This will immediately dispatch an SMS and push notification to the owner's device.</p>
            </div>
            <div className="monitor-modal-footer">
              <button className="monitor-modal-btn cancel" onClick={() => setShowAdmissionModal(false)}>Cancel</button>
              <button className="monitor-modal-btn confirm" onClick={confirmRecommendAdmission}>Send Urgent SMS</button>
            </div>
          </div>
        </div>
      )}

      <div id="toast"></div>
    </>
  );
}
