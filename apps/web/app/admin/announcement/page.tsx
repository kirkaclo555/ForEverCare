"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './announcement.css';

export default function AnnouncementPage() {
  const router = useRouter();
  
  const [isComposing, setIsComposing] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newStatus, setNewStatus] = useState('published');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (!data.error) {
        setAnnouncements(data);
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePostAnnouncement = async () => {
    if (!newTitle || !newContent) {
      alert('Please fill out all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent, status: newStatus })
      });
      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setIsComposing(false);
        fetchAnnouncements();
      } else {
        alert('Failed to post announcement.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      
    
    

    
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} >
        <div className="section-container" style={{ width: '100%', maxWidth: isComposing ? '1200px' : '900px', margin: '0 auto', transition: 'max-width 0.3s ease' }}>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-bullhorn" style={{ color: '#2E5E3E' }}></i> Published Announcements</h2>
                {!isComposing && (
                    <button 
                        onClick={() => setIsComposing(true)} 
                        style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2E5E3E 0%, #1a4d2e 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(46, 94, 62, 0.2)' }}
                    >
                        <i className="fas fa-plus"></i> Compose Announcement
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexDirection: isComposing ? 'row' : 'column' }}>
                
                {/* Announcements List Column */}
                <div style={{ flex: isComposing ? '1' : '100%', width: '100%', transition: 'all 0.3s ease' }}>
                    <div className="announcements-list" id="announcementsList" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {announcements.map(announcement => (
                            <div key={announcement.id} style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', color: '#1a202c', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'serif' }}>{announcement.title}</h3>
                                        <span style={{ color: '#718096', fontSize: '0.85rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>{announcement.date}</span>
                                    </div>
                                    <span style={{ background: announcement.status === 'PUBLISHED' ? '#f0fff4' : '#fff5f5', color: announcement.status === 'PUBLISHED' ? '#2f855a' : '#c53030', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${announcement.status === 'PUBLISHED' ? '#c6f6d5' : '#fed7d7'}` }}>{announcement.status}</span>
                                </div>
                                <p style={{ color: '#2d3748', lineHeight: '1.7', margin: 0, fontSize: '0.95rem', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>{announcement.content}</p>
                                
                                <div style={{ display: 'flex', gap: '15px', marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #e2e8f0', color: '#4a5568', fontSize: '0.9rem', fontWeight: 600 }}>
                                    <span>❤️ {announcement.hearts}</span>
                                    <span>👍 {announcement.likes}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Compose Form Column */}
                {isComposing && (
                    <div style={{ flex: '1.5', width: '100%', position: 'sticky', top: '20px' }}>
                        <div className="compose-area" style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #edf2f7' }}>
                            <div className="compose-title" style={{ marginBottom: '25px', fontSize: '1.3rem', color: '#1a202c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                                <i className="fas fa-pen-fancy" style={{ color: '#2E5E3E' }}></i> Compose Document
                            </div>
                            
                            <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: 600, fontSize: '0.9rem' }}>Document Title</label>
                            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} id="newAnnouncementTitle" placeholder="Enter formal title..." style={{ width: '100%', padding: '12px 15px', border: '1px solid #cbd5e0', borderRadius: '8px', marginBottom: '20px', fontSize: '1rem', fontFamily: 'serif' }} />
                            
                            <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: 600, fontSize: '0.9rem' }}>Document Content</label>
                            <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} id="newAnnouncementContent" rows={10} placeholder="Type announcement body here..." style={{ width: '100%', padding: '15px', border: '1px solid #cbd5e0', borderRadius: '8px', marginBottom: '25px', fontSize: '1rem', resize: 'vertical', lineHeight: '1.6' }}></textarea>
                            
                            <div className="compose-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
                                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} id="newAnnouncementStatus" style={{ padding: '10px 15px', border: '1px solid #cbd5e0', borderRadius: '8px', background: '#f7fafc', cursor: 'pointer', fontWeight: 500 }}>
                                    <option value="published">Publish Document</option>
                                    <option value="draft">Save to Drafts</option>
                                </select>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setIsComposing(false)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e0', color: '#4a5568', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                                        Cancel
                                    </button>
                                    <button disabled={isSubmitting} className="btn-primary" onClick={handlePostAnnouncement} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2E5E3E 0%, #1a4d2e 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(46, 94, 62, 0.2)', opacity: isSubmitting ? 0.7 : 1 }}>
                                        <i className="fas fa-paper-plane"></i> {isSubmitting ? 'Posting...' : 'Finalize & Post'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>

    
    <div className="modal" id="editAnnouncementModal" onClick={() => console.log('if(event.target === this) closeEditModal()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-edit"></i> Edit Announcement</h3>
                <button className="modal-close" onClick={() => console.log('closeEditModal()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <form id="editAnnouncementForm">
                    <input type="hidden" id="editAnnouncementId" />
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" className="form-control" id="editTitle" required />
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea className="form-control" id="editContent" rows={5} required></textarea>
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <div className="radio-group">
                            <label><input type="radio" name="editStatus" value="published" /> Published</label>
                            <label><input type="radio" name="editStatus" value="draft" /> Draft</label>
                        </div>
                    </div>
                </form>
            </div>
            <div className="modal-actions">
                <button className="btn-secondary" onClick={() => console.log('closeEditModal()')}>Cancel</button>
                <button className="btn-primary" onClick={() => console.log('updateAnnouncement()')}>Save Changes</button>
            </div>
        </div>
    </div>



    
    <div id="toast"></div>

    
    </>
  );
}
