"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../../hooks/useNotifications';
import './announcement.css';

export default function AnnouncementPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  
  const [isComposing, setIsComposing] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
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

  const [composeTitle, setComposeTitle] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [attachedMedia, setAttachedMedia] = useState<File[]>([]);

  // Edit & Dropdown states
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState('published');
  const [editExistingFiles, setEditExistingFiles] = useState<any[]>([]);
  const [editExistingMedia, setEditExistingMedia] = useState<any[]>([]);
  const [editNewFiles, setEditNewFiles] = useState<File[]>([]);
  const [editNewMedia, setEditNewMedia] = useState<File[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState<string>('');

  // Dismiss active dropdown on clicking outside
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveDropdownId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleEditClick = (ann: any) => {
    setEditingId(ann.id);
    setEditTitle(ann.title);
    setEditContent(ann.content);
    setEditStatus(ann.status.toLowerCase());
    setEditExistingFiles(ann.files || []);
    setEditExistingMedia(ann.media || []);
    setEditNewFiles([]);
    setEditNewMedia([]);
    setIsEditing(true);
    setActiveDropdownId(null);
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Upload new files
      const uploadedFiles: { name: string; url: string }[] = [];
      for (const f of editNewFiles) {
        const formData = new FormData();
        formData.append('file', f);
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const upData = await upRes.json();
        if (upData.success) {
          uploadedFiles.push({ name: upData.name, url: upData.url });
        }
      }

      // 2. Upload new media
      const uploadedMedia: { name: string; url: string }[] = [];
      for (const m of editNewMedia) {
        const formData = new FormData();
        formData.append('file', m);
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const upData = await upRes.json();
        if (upData.success) {
          uploadedMedia.push({ name: upData.name, url: upData.url });
        }
      }

      // 3. Combine existing (minus any deleted) and new uploads
      const finalFiles = [...editExistingFiles, ...uploadedFiles];
      const finalMedia = [...editExistingMedia, ...uploadedMedia];

      let finalContent = editContent;
      if (finalFiles.length > 0 || finalMedia.length > 0) {
        finalContent += `\n\n---ATTACHMENTS---\n${JSON.stringify({ files: finalFiles, media: finalMedia })}`;
      }

      const res = await fetch(`/api/announcements/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: finalContent, status: editStatus })
      });
      if (res.ok) {
        addNotification('Announcement Updated', editTitle, 'fas fa-edit');
        setIsEditing(false);
        fetchAnnouncements();
      } else {
        alert('Failed to update announcement.');
      }
    } catch (err) {
      alert('Error updating announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmTitle(title);
    setActiveDropdownId(null);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await fetch(`/api/announcements/${deleteConfirmId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        addNotification('Announcement Removed', deleteConfirmTitle, 'fas fa-trash-alt');
        setDeleteConfirmId(null);
        setDeleteConfirmTitle('');
        fetchAnnouncements();
      } else {
        alert('Failed to delete announcement.');
      }
    } catch (err) {
      alert('Error deleting announcement.');
    }
  };

  const handlePost = async () => {
    if (!composeTitle.trim() || !composeContent.trim()) {
        alert('Please enter both a title and content.');
        return;
    }
    setIsSubmitting(true);
    try {
      // 1. Upload files to local storage upload endpoint
      const uploadedFiles: { name: string; url: string }[] = [];
      for (const f of attachedFiles) {
        const formData = new FormData();
        formData.append('file', f);
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const upData = await upRes.json();
        if (upData.success) {
          uploadedFiles.push({ name: upData.name, url: upData.url });
        }
      }

      // 2. Upload media to local storage upload endpoint
      const uploadedMedia: { name: string; url: string }[] = [];
      for (const m of attachedMedia) {
        const formData = new FormData();
        formData.append('file', m);
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const upData = await upRes.json();
        if (upData.success) {
          uploadedMedia.push({ name: upData.name, url: upData.url });
        }
      }

      // 3. Construct the attachments metadata block and append
      let finalContent = composeContent;
      if (uploadedFiles.length > 0 || uploadedMedia.length > 0) {
        finalContent += `\n\n---ATTACHMENTS---\n${JSON.stringify({ files: uploadedFiles, media: uploadedMedia })}`;
      }

      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: composeTitle, content: finalContent, status: 'published' })
      });
      if (res.ok) {
        addNotification('New Announcement Published', composeTitle, 'fas fa-bullhorn');
        setComposeTitle('');
        setComposeContent('');
        setAttachedFiles([]);
        setAttachedMedia([]);
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

  const removeFile = (index: number) => {
      setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };
  const removeMedia = (index: number) => {
      setAttachedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index: number) => {
      setEditExistingFiles(prev => prev.filter((_, i) => i !== index));
  };
  const removeExistingMedia = (index: number) => {
      setEditExistingMedia(prev => prev.filter((_, i) => i !== index));
  };
  const removeEditNewFile = (index: number) => {
      setEditNewFiles(prev => prev.filter((_, i) => i !== index));
  };
  const removeEditNewMedia = (index: number) => {
      setEditNewMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} >
        <div className="section-container" style={{ width: '100%', maxWidth: isComposing ? '1200px' : '100%', margin: '0 auto', transition: 'max-width 0.3s ease' }}>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", letterSpacing: '-0.02em' }}><i className="fas fa-bullhorn" style={{ color: '#2E5E3E' }}></i> Published Announcements</h2>
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
                    <div className="announcements-list" id="announcementsList" style={{ display: 'grid', gridTemplateColumns: isComposing ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
                        {announcements.map(announcement => (
                            <div key={announcement.id} style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', color: '#1a202c', fontSize: '1.2rem', fontWeight: 700, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", letterSpacing: '-0.01em' }}>{announcement.title}</h3>
                                        <span style={{ color: '#718096', fontSize: '0.85rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{announcement.date}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <span style={{ background: announcement.status === 'PUBLISHED' ? '#f0fff4' : '#fff5f5', color: announcement.status === 'PUBLISHED' ? '#2f855a' : '#c53030', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${announcement.status === 'PUBLISHED' ? '#c6f6d5' : '#fed7d7'}` }}>{announcement.status}</span>
                                        
                                        {/* Three dot actions dropdown */}
                                        <div style={{ position: 'relative' }}>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdownId(prev => prev === announcement.id ? null : announcement.id);
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', padding: '4px 8px', fontSize: '1.1rem', transition: 'color 0.2s' }}
                                            >
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>

                                            {activeDropdownId === announcement.id && (
                                                <div style={{ position: 'absolute', right: 0, top: '25px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, width: '120px', overflow: 'hidden' }}>
                                                    <button 
                                                        onClick={() => handleEditClick(announcement)}
                                                        style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    >
                                                        <i className="fas fa-edit" style={{ color: '#4a5568' }}></i> Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(announcement.id, announcement.title)}
                                                        style={{ width: '100%', padding: '10px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #edf2f7' }}
                                                    >
                                                        <i className="fas fa-trash-alt" style={{ color: '#e53e3e' }}></i> Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p style={{ color: '#2d3748', lineHeight: '1.7', margin: 0, fontSize: '0.95rem', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>{announcement.content}</p>
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
                                
                                <div style={{ display: 'flex', gap: '15px', marginTop: '15px', borderTop: '1px solid #edf2f7', paddingTop: '15px', color: '#4a5568', fontSize: '0.9rem', fontWeight: 600 }}>
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
                            <input type="text" value={composeTitle} onChange={(e) => setComposeTitle(e.target.value)} placeholder="Enter formal title..." style={{ width: '100%', padding: '12px 15px', border: '1px solid #cbd5e0', borderRadius: '8px', marginBottom: '20px', fontSize: '1rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }} />
                            
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
                                    <button disabled={isSubmitting} className="btn-primary" onClick={handlePost} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2E5E3E 0%, #1a4d2e 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(46, 94, 62, 0.2)', opacity: isSubmitting ? 0.7 : 1 }}>
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

    {isEditing && (
        <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }} onClick={(e) => { if (e.target === e.currentTarget) setIsEditing(false); }}>
            <div className="modal-content" style={{ background: 'white', borderRadius: '24px', width: '90%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', animation: 'modalSlideUp 0.3s ease-out' }}>
                
                {/* Header with gradient */}
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #2E5E3E 0%, #1a4d2e 100%)', padding: '20px 30px', color: 'white' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                        <i className="fas fa-edit"></i> Edit Announcement Document
                    </h3>
                    <button className="modal-close" onClick={() => setIsEditing(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px', maxHeight: '70vh', overflowY: 'auto' }}>
                    
                    {/* Title */}
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Document Title</label>
                        <input type="text" className="form-control" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e0', fontSize: '1rem', outline: 'none', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", transition: 'border-color 0.2s' }} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                    </div>

                    {/* Content text */}
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Document Content</label>
                            
                            {/* File Upload Trigger buttons inside editing modal */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <label style={{ cursor: 'pointer', color: '#2b6cb0', display: 'flex', alignItems: 'center', gap: '5px', background: '#ebf8ff', padding: '5px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #bee3f8', transition: 'all 0.2s' }} title="Add Files">
                                    <i className="fas fa-paperclip"></i><span>Add Files</span>
                                    <input type="file" style={{ display: 'none' }} multiple onChange={(e) => { if(e.target.files) setEditNewFiles(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                                </label>
                                <label style={{ cursor: 'pointer', color: '#2f855a', display: 'flex', alignItems: 'center', gap: '5px', background: '#f0fff4', padding: '5px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #c6f6d5', transition: 'all 0.2s' }} title="Add Image/Video">
                                    <i className="fas fa-image"></i><span>Add Media</span>
                                    <input type="file" accept="image/*,video/*" style={{ display: 'none' }} multiple onChange={(e) => { if(e.target.files) setEditNewMedia(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                                </label>
                            </div>
                        </div>
                        <textarea className="form-control" rows={6} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e0', fontSize: '0.95rem', resize: 'vertical', lineHeight: '1.6', outline: 'none' }} value={editContent} onChange={(e) => setEditContent(e.target.value)} required></textarea>
                    </div>

                    {/* Manage Existing Attachments */}
                    {(editExistingFiles.length > 0 || editExistingMedia.length > 0) && (
                        <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '12px', border: '1px solid #edf2f7' }}>
                            <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Current Attachments (Saved)</span>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* Files */}
                                {editExistingFiles.map((f, idx) => (
                                    <div key={`exf-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2b6cb0', fontSize: '0.85rem' }}>
                                            <i className="fas fa-file-alt"></i>
                                            <span style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                                        </div>
                                        <button onClick={() => removeExistingFile(idx)} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', padding: '4px' }} title="Delete attachment">
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                ))}

                                {/* Media */}
                                {editExistingMedia.map((m, idx) => (
                                    <div key={`exm-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2f855a', fontSize: '0.85rem' }}>
                                            <i className="fas fa-image"></i>
                                            <span style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name || 'Media Attachment'}</span>
                                        </div>
                                        <button onClick={() => removeExistingMedia(idx)} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', padding: '4px' }} title="Delete attachment">
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Manage Newly Added Attachments */}
                    {(editNewFiles.length > 0 || editNewMedia.length > 0) && (
                        <div style={{ background: '#ebf8ff', padding: '15px', borderRadius: '12px', border: '1px solid #bee3f8' }}>
                            <span style={{ fontSize: '0.75rem', color: '#2b6cb0', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Newly Added (Will save on update)</span>
                            
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {editNewFiles.map((f, idx) => (
                                    <div key={`newf-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#2b6cb0', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #bee3f8' }}>
                                        <i className="fas fa-file-alt"></i> {f.name} 
                                        <i className="fas fa-times" style={{ cursor: 'pointer', marginLeft: '4px', color: '#a0aec0' }} onClick={() => removeEditNewFile(idx)}></i>
                                    </div>
                                ))}
                                {editNewMedia.map((m, idx) => (
                                    <div key={`newm-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fff4', color: '#2f855a', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #c6f6d5' }}>
                                        <i className="fas fa-image"></i> {m.name} 
                                        <i className="fas fa-times" style={{ cursor: 'pointer', marginLeft: '4px', color: '#a0aec0' }} onClick={() => removeEditNewMedia(idx)}></i>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status selection */}
                    <div className="form-group" style={{ borderTop: '1px solid #edf2f7', paddingTop: '15px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>Publishing Status</label>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', color: '#2d3748', fontWeight: 600 }}>
                                <input type="radio" name="editStatus" value="published" checked={editStatus === 'published'} onChange={() => setEditStatus('published')} style={{ width: '18px', height: '18px', accentColor: '#2E5E3E' }} /> Published
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', color: '#2d3748', fontWeight: 600 }}>
                                <input type="radio" name="editStatus" value="draft" checked={editStatus === 'draft'} onChange={() => setEditStatus('draft')} style={{ width: '18px', height: '18px', accentColor: '#2E5E3E' }} /> Save as Draft
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 30px', background: '#f7fafc', borderTop: '1px solid #edf2f7' }}>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e0', borderRadius: '8px', color: '#4a5568', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                        Cancel
                    </button>
                    <button disabled={isSubmitting} className="btn-primary" onClick={handleUpdate} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #2E5E3E 0%, #1a4d2e 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(46, 94, 62, 0.2)', opacity: isSubmitting ? 0.7 : 1 }}>
                        <i className="fas fa-check"></i> {isSubmitting ? 'Updating...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )}

    {deleteConfirmId && (
        <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1010, alignItems: 'center', justifyContent: 'center' }} onClick={() => { setDeleteConfirmId(null); setDeleteConfirmTitle(''); }}>
            <div className="modal-content" style={{ background: 'white', borderRadius: '24px', width: '90%', maxWidth: '440px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', animation: 'modalSlideUp 0.3s ease-out', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                
                {/* Warning icon */}
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', fontSize: '1.75rem', marginBottom: '20px' }}>
                    <i className="fas fa-exclamation-triangle"></i>
                </div>

                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: '#1a202c', fontWeight: 700, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                    Confirm Document Removal
                </h3>
                
                <p style={{ margin: '0 0 25px 0', fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.5' }}>
                    Are you sure you want to permanently delete <strong style={{ color: '#2d3748' }}>"{deleteConfirmTitle}"</strong>? This announcement and its attached files/media will be removed and cannot be recovered.
                </p>

                {/* Actions row */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button onClick={() => { setDeleteConfirmId(null); setDeleteConfirmTitle(''); }} style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e0', borderRadius: '10px', color: '#4a5568', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', flex: 1 }}>
                        Cancel
                    </button>
                    <button onClick={confirmDelete} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(229, 62, 62, 0.2)', flex: 1 }}>
                        <i className="fas fa-trash-alt"></i> Delete Document
                    </button>
                </div>
            </div>
        </div>
    )}

    <div id="toast"></div>
    </>
  );
}
