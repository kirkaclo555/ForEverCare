"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import './monitor.css';

interface Message {
  id: string;
  sender: 'owner' | 'system' | 'admin';
  text: string;
  time: string;
  isUrgent?: boolean;
  replyTo?: {
    id: string;
    sender: string;
    text: string;
  };
}

interface Session {
  id: string;
  petId: string;
  chatStep: string;
  chatCategory: string | null;
  status: 'ACTIVE' | 'CRITICAL' | 'RESOLVED';
  takeoverMode: boolean;
  waitingForVet: boolean;
  vetRequestedAt: string | null;
  admitRecommended: boolean;
  admitAccepted: boolean;
  chatMessages: Message[];
  severity?: string;
  monitoringType?: string;
  medications?: string | null;
  dietInstructions?: string | null;
  careInstructions?: string | null;
  updatesLog?: any[];
  pet: {
    petName: string;
    breed: string;
    species: string;
    avatar: string | null;
    user: {
      fullName: string;
      phoneNumber: string | null;
    }
  }
}

// Helper to check if avatar is a URL (image) vs icon name
const isAvatarUrl = (avatar: string | null | undefined): boolean => {
  if (!avatar) return false;
  return (avatar.startsWith('/') || avatar.startsWith('data:image/') || avatar.startsWith('http')) && !avatar.startsWith('file');
};

// Helper to get the right icon class for pet type avatars
const getPetIconClass = (species: string | null | undefined): string => {
  if (!species) return 'fa-paw';
  const s = species.toLowerCase();
  if (s.includes('cat')) return 'fa-cat';
  if (s.includes('dog')) return 'fa-dog';
  if (s.includes('bird')) return 'fa-feather';
  if (s.includes('rabbit')) return 'fa-carrot';
  return 'fa-paw';
};

const getPhaseFriendlyLabel = (chatStep: string): string => {
  switch (chatStep) {
    case 'CHOOSE_CATEGORY': return 'Choosing Category';
    case 'QUESTION_1':
    case 'QUESTION_2':
    case 'QUESTION_3':
    case 'QUESTION_4': return 'AI Triage Questions';
    case 'DETAILS': return 'AI Diagnosing';
    case 'MONITORING': return 'Active Monitoring';
    case 'MONITORING_DONE': return 'Monitoring Complete';
    case 'FINISHED': return 'Session Resolved';
    default: return chatStep || 'Active';
  }
};

export default function PetMonitorPage() {
  const { addNotification } = useNotifications();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdmissionModal, setShowAdmissionModal] = useState<boolean>(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState<boolean>(false);
  const [showDirectivesModal, setShowDirectivesModal] = useState<boolean>(false);
  const [savingDirectives, setSavingDirectives] = useState<boolean>(false);
  const [directivesForm, setDirectivesForm] = useState({
    medications: '',
    dietInstructions: '',
    careInstructions: '',
    severity: 'MILD',
    note: ''
  });
  const [chatInput, setChatInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessageCountRef = useRef<number>(0);

  const openDirectivesModal = () => {
    if (!activeSession) return;
    setDirectivesForm({
      medications: activeSession.medications || '',
      dietInstructions: activeSession.dietInstructions || '',
      careInstructions: activeSession.careInstructions || '',
      severity: activeSession.severity || 'MILD',
      note: ''
    });
    setShowDirectivesModal(true);
  };

  const handleSaveDirectives = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionId) return;
    setSavingDirectives(true);

    try {
      const res = await fetch('/api/monitoring/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vet_update',
          monitorId: activeSessionId,
          ...directivesForm
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSessions(prev => prev.map(s => s.id === activeSessionId ? data.monitor : s));
        addNotification(
          'Directives Updated',
          `Home-care instructions and meds updated for ${activeSession?.pet?.petName}.`,
          'fas fa-notes-medical'
        );
        setShowDirectivesModal(false);
      } else {
        alert('Failed to update directives.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating directives.');
    } finally {
      setSavingDirectives(false);
    }
  };

  // Fetch all active monitoring sessions
  const fetchSessions = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch('/api/monitoring/chat');
      if (res.ok) {
        const data = await res.json();
        const activeSessions: Session[] = data.reports || [];
        setSessions(activeSessions);
        
        // Auto select first session if none selected
        if (activeSessions.length > 0 && !activeSessionId) {
          const firstSession = activeSessions[0];
          if (firstSession) {
            setActiveSessionId(firstSession.id);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching sessions', e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchSessions(true);
    const interval = setInterval(() => {
      fetchSessions(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    // Only scroll to bottom when a NEW message arrives (count increased) or session changes
    const currentCount = activeSession?.chatMessages?.length || 0;
    if (currentCount > prevMessageCountRef.current || !prevMessageCountRef.current) {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    }
    prevMessageCountRef.current = currentCount;
  }, [activeSession?.chatMessages?.length, activeSessionId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeSessionId) return;

    const messageText = chatInput.trim();
    setChatInput('');
    const replyData = replyingTo ? { id: replyingTo.id, sender: replyingTo.sender, text: replyingTo.text } : undefined;
    setReplyingTo(null);

    try {
      const res = await fetch('/api/monitoring/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'message',
          monitorId: activeSessionId,
          sender: 'admin',
          text: messageText,
          replyTo: replyData
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Update local session immediately
        setSessions(prev => prev.map(s => s.id === activeSessionId ? data.monitor : s));
      }
    } catch (error) {
      console.error('Failed to send admin message', error);
    }
  };

  const handleReplyToMessage = (msg: Message) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleTakeoverToggle = async (checked: boolean) => {
    if (!activeSessionId) return;

    try {
      const res = await fetch('/api/monitoring/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'takeover',
          monitorId: activeSessionId,
          takeoverMode: checked
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSessions(prev => prev.map(s => s.id === activeSessionId ? data.monitor : s));
        addNotification(
          checked ? 'Chat Takeover Active' : 'Chat Takeover Released',
          `Manual chat control is now ${checked ? 'enabled' : 'disabled'} for ${activeSession?.pet.petName}.`,
          checked ? 'fas fa-user-md' : 'fas fa-robot'
        );
      }
    } catch (e) {
      console.error('Failed to toggle takeover', e);
    }
  };

  const confirmRecommendAdmission = async () => {
    if (!activeSessionId || !activeSession) return;

    try {
      const res = await fetch('/api/monitoring/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recommend_admission',
          monitorId: activeSessionId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSessions(prev => prev.map(s => s.id === activeSessionId ? data.monitor : s));
        
        // Simulate SMS toast / Notification
        addNotification('Urgent Admission Recommended', `SMS sent to ${activeSession.pet.user.fullName} for ${activeSession.pet.petName}.`, 'fas fa-ambulance');
        
        const toast = document.getElementById('toast');
        if (toast) {
          toast.innerHTML = `<i class="fas fa-sms"></i> SMS alert successfully sent to ${activeSession.pet.user.fullName}.`;
          toast.className = 'toast show';
          setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
        }
      }
    } catch (error) {
      console.error('Failed to recommend admission', error);
    }

    setShowAdmissionModal(false);
  };

  const handleEndSession = () => {
    if (!activeSessionId) return;
    setShowEndSessionModal(true);
  };

  const confirmEndSession = async () => {
    if (!activeSessionId) return;

    try {
      const res = await fetch('/api/monitoring/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          monitorId: activeSessionId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSessions(prev => prev.map(s => s.id === activeSessionId ? data.monitor : s));
        addNotification(
          'Session Ended',
          `Monitoring session for ${activeSession?.pet?.petName} has been resolved.`,
          'success'
        );
      }
    } catch (error) {
      console.error('Failed to end session', error);
    }

    setShowEndSessionModal(false);
  };

  const getStatusLabel = (session: Session) => {
    if (session.admitAccepted) return 'Admission Accepted';
    if (session.admitRecommended) return 'Admission Recommended';
    if (session.waitingForVet && !session.takeoverMode) return '🚑 Waiting for Vet';
    if (session.status === 'CRITICAL') return 'Requires Attention';
    
    switch (session.chatStep) {
      case 'CHOOSE_CATEGORY': return 'Choosing Category';
      case 'QUESTION_1':
      case 'QUESTION_2':
      case 'QUESTION_3':
      case 'QUESTION_4':
      case 'DETAILS': return 'AI Diagnosing';
      case 'MONITORING': return 'Active monitoring';
      case 'MONITORING_DONE': return 'Monitoring completed';
      case 'FINISHED': return 'Resolved';
      default: return 'Active';
    }
  };

  const getStatusClass = (session: Session) => {
    if (session.waitingForVet && !session.takeoverMode) return 'waiting';
    if (session.status === 'CRITICAL') return 'attention';
    if (session.chatStep === 'FINISHED') return 'resolved';
    return 'diagnosing';
  };

  const needsUrgentRing = (session: Session) =>
    (session.waitingForVet && !session.takeoverMode) || session.status === 'CRITICAL';

  // Sort sessions: waiting-for-vet first, then critical, then rest
  const sortedSessions = [...sessions].sort((a, b) => {
    const priority = (s: Session) => {
      if (s.waitingForVet && !s.takeoverMode) return 0;
      if (s.status === 'CRITICAL') return 1;
      return 2;
    };
    return priority(a) - priority(b);
  });

  return (
    <>
      <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }}>
        <div style={{ padding: '16px 20px 12px' }}>
          <h1 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '26px', fontWeight: 700 }}>
            <i className="fas fa-heartbeat" style={{ color: '#2E5E3E', fontSize: '22px' }}></i>
            Pet Monitor &amp; Diagnostics
          </h1>
          <p style={{ color: '#94a3b8', margin: '3px 0 0 34px', fontSize: '13.5px' }}>
            Oversee automated AI pet diagnostics and intervene when necessary.
          </p>
        </div>

        <div style={{ padding: '0 20px 20px 20px' }}>
          <div className="monitor-container">

            {/* ---- LEFT SIDEBAR ---- */}
            <div className="monitor-sidebar">
              <div className="monitor-sidebar-header">
                <h3>
                  <i className="fas fa-list-ul"></i>
                  Active Sessions
                  <span style={{ 
                    marginLeft: 'auto', 
                    background: sessions.length > 0 ? '#1a5c3a' : '#e2e8f0', 
                    color: sessions.length > 0 ? 'white' : '#94a3b8',
                    borderRadius: '999px',
                    padding: '1px 7px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {sessions.length}
                  </span>
                </h3>
              </div>

              <div className="pet-list">
                {loading ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px', color: '#2E5E3E' }}></i>
                    Loading sessions...
                  </div>
                ) : sessions.length === 0 ? (
                  <div style={{ padding: '30px 16px', textAlign: 'center', color: '#94a3b8' }}>
                    <i className="fas fa-heartbeat" style={{ fontSize: '2rem', color: '#e2e8f0', display: 'block', marginBottom: '10px' }}></i>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No active sessions</div>
                    <div style={{ fontSize: '12px' }}>Monitoring sessions started by pet owners will appear here.</div>
                  </div>
                ) : (
                  sortedSessions.map(session => (
                    <div
                      key={session.id}
                      className={`pet-item ${activeSessionId === session.id ? 'active' : ''}`}
                      onClick={() => setActiveSessionId(session.id)}
                    >
                      <div
                        className={`pet-avatar ${needsUrgentRing(session) ? 'pulse-ring' : ''}`}
                        style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px' }}
                      >
                        {isAvatarUrl(session.pet?.avatar) ? (
                          <img src={session.pet.avatar!} alt={session.pet.petName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          <i className={`fas ${getPetIconClass(session.pet?.species)}`} style={{ fontSize: '1.1rem', color: 'white' }}></i>
                        )}
                      </div>
                      <div className="pet-info">
                        <h4>{session.pet?.petName || 'Unknown'}</h4>
                        <p>{session.pet?.species || 'Unknown'} · {session.pet?.breed || 'Unknown'}</p>
                        <p style={{ color: '#64748b' }}>{session.pet?.user?.fullName || 'Unknown Owner'}</p>
                        <div style={{ marginTop: '5px' }}>
                          <span className={`status-indicator ${getStatusClass(session)}`}>
                            {getStatusLabel(session)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ---- RIGHT CHAT AREA ---- */}
            {activeSession ? (
              <div className="monitor-chat-area">

                {/* Header */}
                <div className="chat-header">
                  <div className="chat-header-row1">
                    {/* Pet Info */}
                    <div className="chat-header-info">
                      <div
                        className="chat-header-pet-avatar"
                        style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {isAvatarUrl(activeSession.pet?.avatar) ? (
                          <img src={activeSession.pet.avatar!} alt={activeSession.pet.petName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          <i className={`fas ${getPetIconClass(activeSession.pet?.species)}`} style={{ fontSize: '1.2rem', color: 'white' }}></i>
                        )}
                      </div>
                      <div className="chat-header-meta">
                        <h3>{activeSession.pet?.petName || 'Unknown'}</h3>
                        <p>
                          <i className="fas fa-user" style={{ marginRight: '5px', fontSize: '11px', color: '#94a3b8' }}></i>
                          {activeSession.pet?.user?.fullName || 'Unknown Owner'}
                          {activeSession.pet?.user?.phoneNumber && (
                            <span style={{ marginLeft: '8px', color: '#94a3b8' }}>
                              <i className="fas fa-phone" style={{ marginRight: '4px', fontSize: '10px' }}></i>
                              {activeSession.pet.user.phoneNumber}
                            </span>
                          )}
                        </p>
                        <div className="phase-pill">
                          <i className="fas fa-circle-dot"></i>
                          {getPhaseFriendlyLabel(activeSession.chatStep)}
                        </div>
                      </div>
                    </div>

                    {/* Vet Takeover Toggle */}
                    <div className="takeover-toggle">
                      <span className="toggle-label">Vet Takeover</span>
                      <label className="switch" style={{ margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={activeSession.takeoverMode}
                          onChange={(e) => handleTakeoverToggle(e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                      <span
                        className="toggle-status"
                        style={{ color: activeSession.takeoverMode ? '#dc2626' : '#15803d' }}
                      >
                        {activeSession.takeoverMode ? 'Manual' : 'AI'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="chat-actions-row">
                    <button
                      className="btn-urgent"
                      onClick={() => setShowAdmissionModal(true)}
                      disabled={activeSession.admitRecommended}
                    >
                      <i className="fas fa-ambulance"></i>
                      {activeSession.admitAccepted
                        ? 'Admission Accepted'
                        : activeSession.admitRecommended
                          ? 'Admission Offered'
                          : 'Recommend Admission'}
                    </button>
                    <button
                      className="btn-directives"
                      onClick={openDirectivesModal}
                      title="Update medications, care instructions, and diet"
                    >
                      <i className="fas fa-notes-medical"></i>
                      Update Meds &amp; Care
                    </button>
                    <button
                      className="btn-end-session"
                      onClick={handleEndSession}
                      disabled={activeSession.chatStep === 'FINISHED'}
                    >
                      <i className="fas fa-check-circle"></i>
                      {activeSession.chatStep === 'FINISHED' ? 'Session Ended' : 'End Session'}
                    </button>
                  </div>
                </div>

                {/* Care Summary Strip */}
                <div className="care-summary-strip">
                  <div className="care-card">
                    <div className="care-card-label">
                      <i className="fas fa-pills"></i>
                      Medications
                    </div>
                    <div className="care-card-value">
                      {activeSession.medications || 'None prescribed yet.'}
                    </div>
                  </div>
                  <div className="care-card">
                    <div className="care-card-label">
                      <i className="fas fa-utensils"></i>
                      Diet
                    </div>
                    <div className="care-card-value">
                      {activeSession.dietInstructions || 'Fresh water. Bland, digestible food.'}
                    </div>
                  </div>
                  <div className="care-card">
                    <div className="care-card-label">
                      <i className="fas fa-clipboard-list"></i>
                      Care Instructions
                    </div>
                    <div className="care-card-value">
                      {activeSession.careInstructions || 'Keep in a quiet, comfortable space. Observe for changes.'}
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="chat-messages" ref={chatMessagesRef}>
                  <div className="chat-date-divider">
                    <span>Chat Started</span>
                  </div>

                  {activeSession.chatMessages?.map((msg: Message) => {
                    const isOwner = msg.sender === 'owner';
                    const isSystem = msg.sender === 'system';
                    const isAdmin = msg.sender === 'admin';

                    return (
                      <div
                        key={msg.id}
                        className={`message ${msg.sender} ${msg.isUrgent ? 'urgent' : ''}`}
                        onContextMenu={(e) => { e.preventDefault(); handleReplyToMessage(msg); }}
                        onDoubleClick={() => handleReplyToMessage(msg)}
                        title="Right-click or double-click to reply"
                      >
                        {/* Pet/Owner avatar (left side for owner) */}
                        {isOwner && (
                          <div className="message-avatar" style={{ background: '#f1f5f9' }}>
                            {isAvatarUrl(activeSession.pet?.avatar) ? (
                              <img src={activeSession.pet.avatar!} alt={activeSession.pet.petName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <i className={`fas ${getPetIconClass(activeSession.pet?.species)}`} style={{ fontSize: '13px', color: '#94a3b8' }}></i>
                            )}
                          </div>
                        )}

                        <div className="message-inner">
                          {/* Reply quote */}
                          {msg.replyTo && (
                            <div className="reply-quote-inline">
                              <i className="fas fa-reply" style={{ fontSize: '9px', flexShrink: 0 }}></i>
                              <span className="reply-quote-sender">
                                {msg.replyTo.sender === 'owner'
                                  ? (activeSession.pet?.petName || 'Pet')
                                  : msg.replyTo.sender === 'system' ? 'AI' : 'Vet'}
                              </span>
                              <span className="reply-quote-text">
                                {msg.replyTo.text.length > 60 ? msg.replyTo.text.slice(0, 60) + '...' : msg.replyTo.text}
                              </span>
                            </div>
                          )}
                          <div className="message-bubble">
                            {msg.isUrgent && <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>}
                            {msg.text}
                          </div>
                          <div className="message-meta">
                            {msg.sender === 'owner'
                              ? (activeSession.pet?.petName || 'Pet Owner')
                              : msg.sender === 'system'
                                ? 'AI Assistant'
                                : 'Veterinarian'
                            }
                            <span>·</span>
                            {msg.time}
                          </div>
                        </div>

                        {/* System/Admin avatar (right side) */}
                        {!isOwner && (
                          <div
                            className="message-avatar"
                            style={{
                              background: isSystem ? '#0d9488' : '#1a5c3a',
                              flexShrink: 0
                            }}
                          >
                            <i
                              className={`fas fa-${isSystem ? 'robot' : 'user-md'}`}
                              style={{ fontSize: '12px', color: 'white' }}
                            ></i>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input */}
                <div className="chat-input-area">
                  {replyingTo && (
                    <div className="reply-preview-bar">
                      <div className="reply-preview-content">
                        <i className="fas fa-reply" style={{ color: '#1a5c3a', fontSize: '12px', flexShrink: 0 }}></i>
                        <div>
                          <span className="reply-preview-sender">
                            Replying to {replyingTo.sender === 'owner'
                              ? (activeSession.pet?.petName || 'Pet Owner')
                              : replyingTo.sender === 'system' ? 'AI Assistant' : 'Veterinarian'}
                          </span>
                          <span className="reply-preview-text">
                            {replyingTo.text.length > 80 ? replyingTo.text.slice(0, 80) + '...' : replyingTo.text}
                          </span>
                        </div>
                      </div>
                      <button className="reply-cancel-btn" onClick={cancelReply} type="button">
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="chat-input-form">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={activeSession.takeoverMode
                        ? "Type a message to pet owner..."
                        : "Type a message (auto-enables vet takeover)..."}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button type="submit" className="chat-send-btn" disabled={!chatInput.trim()}>
                      Send <i className="fas fa-paper-plane"></i>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="monitor-empty-state">
                <div className="empty-icon">
                  <i className="fas fa-heartbeat"></i>
                </div>
                <h4>No session selected</h4>
                <p>Select a monitoring session from the left panel to view the diagnostic chat and pet care information.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- MODALS ---- */}

      {/* Recommend Admission Modal */}
      {showAdmissionModal && activeSession && (
        <div className="monitor-modal-overlay">
          <div className="monitor-modal-content">
            <div className="monitor-modal-header" style={{ background: '#fff5f5' }}>
              <h3>
                <i className="fas fa-ambulance" style={{ color: '#dc2626' }}></i>
                Urgent Admission
              </h3>
            </div>
            <div className="monitor-modal-body">
              <p>
                Recommend emergency clinic admission for <strong>{activeSession.pet?.petName || 'this pet'}</strong>?
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>
                This will push an admission suggestion in the owner's app chat and trigger an urgent SMS notification to <strong>{activeSession.pet?.user?.fullName}</strong>.
              </p>
            </div>
            <div className="monitor-modal-footer">
              <button className="monitor-modal-btn cancel" onClick={() => setShowAdmissionModal(false)}>Cancel</button>
              <button className="monitor-modal-btn confirm" onClick={confirmRecommendAdmission}>
                <i className="fas fa-ambulance"></i>
                Send Recommendation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Session Modal */}
      {showEndSessionModal && activeSession && (
        <div className="monitor-modal-overlay">
          <div className="monitor-modal-content">
            <div className="monitor-modal-header" style={{ background: '#f0fff4' }}>
              <h3>
                <i className="fas fa-check-circle" style={{ color: '#1a5c3a' }}></i>
                End Monitoring Session
              </h3>
            </div>
            <div className="monitor-modal-body">
              <p>
                End the monitoring session for <strong>{activeSession.pet?.petName || 'this pet'}</strong>?
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>
                This will close the chat for both parties and mark the session as resolved. The owner will see a session-ended message.
              </p>
            </div>
            <div className="monitor-modal-footer">
              <button className="monitor-modal-btn cancel" onClick={() => setShowEndSessionModal(false)}>Cancel</button>
              <button className="monitor-modal-btn confirm green" onClick={confirmEndSession}>
                <i className="fas fa-check"></i>
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Directives Modal */}
      {showDirectivesModal && activeSession && (
        <div className="monitor-modal-overlay">
          <div className="monitor-modal-content" style={{ maxWidth: '580px', width: '90%' }}>
            <div className="monitor-modal-header" style={{ background: '#f0fff4' }}>
              <h3 style={{ color: '#1a5c3a' }}>
                <i className="fas fa-notes-medical"></i>
                Update Directives — {activeSession.pet?.petName}
              </h3>
            </div>
            <form onSubmit={handleSaveDirectives}>
              <div className="monitor-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                <div className="monitor-form-field">
                  <label className="monitor-form-label">
                    <i className="fas fa-pills" style={{ color: '#1a5c3a' }}></i>
                    Medications to Drink / Take
                  </label>
                  <input
                    type="text"
                    className="monitor-form-input"
                    placeholder="e.g. Amoxicillin 2.5ml twice daily after meals"
                    value={directivesForm.medications}
                    onChange={(e) => setDirectivesForm({ ...directivesForm, medications: e.target.value })}
                  />
                </div>

                <div className="monitor-form-field">
                  <label className="monitor-form-label">
                    <i className="fas fa-utensils" style={{ color: '#1a5c3a' }}></i>
                    Dietary Plan
                  </label>
                  <input
                    type="text"
                    className="monitor-form-input"
                    placeholder="e.g. Boiled chicken with white rice in small portions."
                    value={directivesForm.dietInstructions}
                    onChange={(e) => setDirectivesForm({ ...directivesForm, dietInstructions: e.target.value })}
                  />
                </div>

                <div className="monitor-form-field">
                  <label className="monitor-form-label">
                    <i className="fas fa-clipboard-list" style={{ color: '#1a5c3a' }}></i>
                    Home Care Instructions
                  </label>
                  <textarea
                    rows={2}
                    className="monitor-form-input"
                    style={{ resize: 'vertical', minHeight: '64px' }}
                    placeholder="e.g. Keep in a warm, quiet room. Restrict physical exertion."
                    value={directivesForm.careInstructions}
                    onChange={(e) => setDirectivesForm({ ...directivesForm, careInstructions: e.target.value })}
                  />
                </div>

                <div className="monitor-form-grid">
                  <div className="monitor-form-field" style={{ marginBottom: 0 }}>
                    <label className="monitor-form-label">
                      <i className="fas fa-thermometer-half" style={{ color: '#1a5c3a' }}></i>
                      Severity Assessment
                    </label>
                    <select
                      className="monitor-form-input"
                      value={directivesForm.severity}
                      onChange={(e) => setDirectivesForm({ ...directivesForm, severity: e.target.value })}
                    >
                      <option value="MILD">Mild — Approve Home Monitoring</option>
                      <option value="SEVERE">Severe — Require In-Clinic Visit</option>
                    </select>
                  </div>
                  <div className="monitor-form-field" style={{ marginBottom: 0 }}>
                    <label className="monitor-form-label">
                      <i className="fas fa-clock" style={{ color: '#1a5c3a' }}></i>
                      Timeline Note / Update
                    </label>
                    <input
                      type="text"
                      className="monitor-form-input"
                      placeholder="e.g. Follow-up after 12 hours"
                      value={directivesForm.note}
                      onChange={(e) => setDirectivesForm({ ...directivesForm, note: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="monitor-modal-footer">
                <button
                  type="button"
                  className="monitor-modal-btn cancel"
                  onClick={() => setShowDirectivesModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="monitor-modal-btn confirm green"
                  disabled={savingDirectives}
                >
                  {savingDirectives ? (
                    <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                  ) : (
                    <><i className="fas fa-save"></i> Save &amp; Send to Owner</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div id="toast"></div>
    </>
  );
}
