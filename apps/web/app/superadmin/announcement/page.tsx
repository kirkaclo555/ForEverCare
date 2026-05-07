"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../../hooks/useNotifications';
import './announcement.css';

export default function AnnouncementPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  
  const [isComposing, setIsComposing] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([
    { id: 1, title: 'Holiday Hours Notice', content: 'Our clinic will be operating on reduced hours during the upcoming holiday weekend.', status: 'published', date: 'Oct 25, 2024', reactions: { '👍': 12, '❤️': 5, '😮': 2 }, files: [], media: [] },
    { id: 2, title: 'New Vaccination Drive', content: 'Join us next week for a discounted rabies vaccination drive for all registered pets.', status: 'published', date: 'Oct 20, 2024', reactions: { '👍': 45, '❤️': 30, '😂': 5 }, files: [], media: [] },
  ]);

  const [composeTitle, setComposeTitle] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [attachedMedia, setAttachedMedia] = useState<File[]>([]);

  const handlePost = () => {
    if (!composeTitle.trim() || !composeContent.trim()) {
        alert('Please enter both a title and content.');
        return;
    }
    const newAnnouncement = {
        id: Date.now(),
        title: composeTitle,
        content: composeContent,
        status: 'published',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        reactions: {},
        files: attachedFiles.map(f => ({ name: f.name, url: URL.createObjectURL(f), isImage: f.type.startsWith('image/') })),
        media: attachedMedia.map(m => ({ name: m.name, url: URL.createObjectURL(m), isImage: m.type.startsWith('image/'), isVideo: m.type.startsWith('video/') }))
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    addNotification('New Announcement Published', composeTitle, 'fas fa-bullhorn');
    setIsComposing(false);
    setComposeTitle('');
    setComposeContent('');
    setAttachedFiles([]);
    setAttachedMedia([]);
  };

  const removeFile = (index: number) => {
      setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };
  const removeMedia = (index: number) => {
      setAttachedMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      
    
    

    
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} >
        <div className="section-container" style={{ width: '100%', maxWidth: isComposing ? '1200px' : '100%', margin: '0 auto', transition: 'max-width 0.3s ease' }}>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-bullhorn" style={{ color: '#2E5E3E' }}></i> Published Announcements</h2>
                {!isComposing && (
                    <button 
                        onClick={() => setIsComposing(true)} 
                        style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #2E5E3E 0%, #1a4d2e 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(46, 94, 62, 0.2)' }}
                    >
                        <i className="fas fa-plus"></i> Create new
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexDirection: isComposing ? 'row' : 'column' }}>
                
                {/* Announcements List Column */}
                <div style={{ flex: isComposing ? '1' : '100%', width: '100%', transition: 'all 0.3s ease' }}>
                    <div className="announcements-list" id="announcementsList" style={{ display: 'grid', gridTemplateColumns: isComposing ? '1fr' : 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>
                        {announcements.map(announcement => (
                            <div key={announcement.id} style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', color: '#1a202c', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'serif' }}>{announcement.title}</h3>
                                        <span style={{ color: '#718096', fontSize: '0.85rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>{announcement.date}</span>
                                    </div>
                                    <span style={{ background: announcement.status === 'published' ? '#f0fff4' : '#fff5f5', color: announcement.status === 'published' ? '#2f855a' : '#c53030', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${announcement.status === 'published' ? '#c6f6d5' : '#fed7d7'}` }}>{announcement.status.toUpperCase()}</span>
                                </div>
                                <p style={{ color: '#2d3748', lineHeight: '1.7', margin: 0, fontSize: '0.95rem', textAlign: 'justify' }}>{announcement.content}</p>
                                {(announcement.media?.length > 0) && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                                        {announcement.media.map((m: any, i: number) => (
                                            m.url ? (
                                                m.isImage ? <img key={`m-${i}`} src={m.url} alt={m.name} style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'cover' }} />
                                                : m.isVideo ? <video key={`m-${i}`} src={m.url} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #e2e8f0' }}></video>
                                                : <span key={`m-${i}`} style={{ fontSize: '0.8rem', color: '#38a169', background: '#f0fff4', padding: '4px 8px', borderRadius: '4px' }}><i className="fas fa-image"></i> {m.name}</span>
                                            ) : (
                                                <span key={`m-${i}`} style={{ fontSize: '0.8rem', color: '#38a169', background: '#f0fff4', padding: '4px 8px', borderRadius: '4px' }}><i className="fas fa-image"></i> {m.name || m}</span>
                                            )
                                        ))}
                                    </div>
                                )}
                                {(announcement.files?.length > 0) && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                                        {announcement.files.map((f: any, i: number) => (
                                            f.url ? (
                                                <a key={`f-${i}`} href={f.url} download={f.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#3182ce', background: '#ebf8ff', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', border: '1px solid #bee3f8' }}>
                                                    <i className="fas fa-paperclip"></i> {f.name} <i className="fas fa-download" style={{marginLeft: '4px', fontSize: '0.7rem'}}></i>
                                                </a>
                                            ) : (
                                                <span key={`f-${i}`} style={{ fontSize: '0.8rem', color: '#3182ce', background: '#ebf8ff', padding: '4px 8px', borderRadius: '4px' }}><i className="fas fa-paperclip"></i> {f.name || f}</span>
                                            )
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px', borderTop: '1px solid #edf2f7', paddingTop: '15px', flexWrap: 'wrap' }}>
                                    {announcement.reactions && Object.entries(announcement.reactions).map(([emoji, count]) => (
                                        <div key={emoji} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f7fafc', padding: '5px 10px', borderRadius: '15px', border: '1px solid #e2e8f0' }} title="Reactions from pet owners">
                                            <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568' }}>{String(count)}</span>
                                        </div>
                                    ))}
                                    {(!announcement.reactions || Object.keys(announcement.reactions).length === 0) && (
                                        <span style={{ fontSize: '0.85rem', color: '#a0aec0', fontStyle: 'italic' }}>No reactions yet</span>
                                    )}
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
                            <input type="text" value={composeTitle} onChange={(e) => setComposeTitle(e.target.value)} placeholder="Enter formal title..." style={{ width: '100%', padding: '12px 15px', border: '1px solid #cbd5e0', borderRadius: '8px', marginBottom: '20px', fontSize: '1rem', fontFamily: 'serif' }} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                                <label style={{ color: '#4a5568', fontWeight: 600, fontSize: '0.9rem' }}>Document Content</label>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <label style={{ cursor: 'pointer', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '5px' }} title="Add Files">
                                        <i className="fas fa-paperclip" style={{ fontSize: '1.1rem' }}></i><span style={{fontSize: '0.8rem'}}>Files</span>
                                        <input type="file" style={{ display: 'none' }} multiple onChange={(e) => { if(e.target.files) setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                                    </label>
                                    <label style={{ cursor: 'pointer', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '5px' }} title="Add Image/Video">
                                        <i className="fas fa-image" style={{ fontSize: '1.1rem' }}></i><span style={{fontSize: '0.8rem'}}>Media</span>
                                        <input type="file" accept="image/*,video/*" style={{ display: 'none' }} multiple onChange={(e) => { if(e.target.files) setAttachedMedia(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                                    </label>
                                </div>
                            </div>
                            <textarea value={composeContent} onChange={(e) => setComposeContent(e.target.value)} rows={10} placeholder="Type announcement body here..." style={{ width: '100%', padding: '15px', border: '1px solid #cbd5e0', borderRadius: '8px', marginBottom: '10px', fontSize: '1rem', resize: 'vertical', lineHeight: '1.6' }}></textarea>
                            
                            {(attachedFiles.length > 0 || attachedMedia.length > 0) && (
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '25px' }}>
                                    {attachedFiles.map((f, idx) => (
                                        <div key={`af-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ebf8ff', color: '#2b6cb0', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                                            <i className="fas fa-file-alt"></i> {f.name} <i className="fas fa-times" style={{cursor: 'pointer', marginLeft: '4px'}} onClick={() => removeFile(idx)}></i>
                                        </div>
                                    ))}
                                    {attachedMedia.map((m, idx) => (
                                        <div key={`am-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fff4', color: '#2f855a', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                                            <i className="fas fa-image"></i> {m.name} <i className="fas fa-times" style={{cursor: 'pointer', marginLeft: '4px'}} onClick={() => removeMedia(idx)}></i>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="compose-actions" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => { setIsComposing(false); setComposeTitle(''); setComposeContent(''); setAttachedFiles([]); setAttachedMedia([]); }} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e0', color: '#4a5568', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                                        Cancel
                                    </button>
                                    <button className="btn-primary" onClick={handlePost} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2E5E3E 0%, #1a4d2e 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(46, 94, 62, 0.2)' }}>
                                        <i className="fas fa-paper-plane"></i> Finalize & Post
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
