"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import './tutorials.css';

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  isLocal: boolean;
}

export default function TutorialsPage() {
  const router = useRouter();

  const [videos, setVideos] = useState<Video[]>([
    {
      id: '1',
      title: 'Platform Overview',
      description: 'A quick tour of the FurEver Paw Care admin dashboard.',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      isLocal: false
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);

  const resetForm = () => {
    setFormTitle('');
    setFormDesc('');
    setFormFile(null);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingVideoId(null);
    resetForm();
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return alert('Title is required');

    let videoUrl = '';
    let isLocal = false;

    if (formFile) {
      videoUrl = URL.createObjectURL(formFile);
      isLocal = true;
    } else {
      return alert('Please upload a video file.');
    }

    const newVideo: Video = {
      id: Date.now().toString(),
      title: formTitle,
      description: formDesc,
      url: videoUrl,
      isLocal
    };

    setVideos([...videos, newVideo]);
    closeAddModal();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return alert('Title is required');

    const currentVideo = videos.find(v => v.id === editingVideoId);
    let videoUrl = currentVideo?.url || '';
    let isLocal = currentVideo?.isLocal || false;

    if (formFile) {
      videoUrl = URL.createObjectURL(formFile);
      isLocal = true;
    }

    setVideos(videos.map(v => 
      v.id === editingVideoId 
        ? { ...v, title: formTitle, description: formDesc, url: videoUrl, isLocal } 
        : v
    ));
    closeEditModal();
  };

  const openEditModal = (video: Video) => {
    setEditingVideoId(video.id);
    setFormTitle(video.title);
    setFormDesc(video.description);
    setFormFile(null);
    setIsEditModalOpen(true);
  };

  const openWatchModal = (video: Video) => {
    setActiveVideo(video);
    setIsWatchModalOpen(true);
  };

  const openDeleteModal = (video: Video) => {
    setActiveVideo(video);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (activeVideo) {
      setVideos(videos.filter(v => v.id !== activeVideo.id));
    }
    setIsDeleteModalOpen(false);
    setActiveVideo(null);
  };

  return (
    <>
      <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} id="mainContent">
          <div className="tutorials-container">
              <div className="header-actions">
                  <h2><i className="fas fa-graduation-cap"></i> Video Tutorials</h2>
                  <button className="btn-add" onClick={() => setIsAddModalOpen(true)}>
                    <i className="fas fa-plus"></i> Add New Video
                  </button>
              </div>
              <div id="videosGrid" className="videos-grid">
                  {videos.length === 0 ? (
                    <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#a0aec0'}}>
                      <i className="fas fa-video-slash" style={{fontSize: '3rem', marginBottom: '15px'}}></i>
                      <p>No tutorial videos added yet.</p>
                    </div>
                  ) : (
                    videos.map(video => (
                      <div className="video-card" key={video.id}>
                          <div className="video-thumbnail" onClick={() => openWatchModal(video)}>
                              {video.isLocal ? (
                                <video src={video.url} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                              ) : (
                                <img src={`https://img.youtube.com/vi/${video.url.split('embed/')[1]?.split('?')[0]}/hqdefault.jpg`} alt={video.title} onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/640x360?text=Video')} />
                              )}
                              <div className="play-button"><i className="fas fa-play"></i></div>
                          </div>
                          <div className="video-info">
                              <h3 className="video-title">{video.title}</h3>
                              <p className="video-desc">{video.description}</p>
                              <div className="video-meta">
                                  <span><i className="fas fa-clock"></i> Just now</span>
                              </div>
                              <div className="card-actions" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                                  <button className="btn-edit" onClick={() => openEditModal(video)}><i className="fas fa-edit"></i> Edit</button>
                                  <button className="btn-delete" onClick={() => openDeleteModal(video)}><i className="fas fa-trash"></i> Delete</button>
                              </div>
                          </div>
                      </div>
                    ))
                  )}
              </div>
          </div>
      </div>

      {isAddModalOpen && (
        <div className="modal" style={{display: 'flex'}} onClick={(e) => { if(e.target === e.currentTarget) closeAddModal() }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3 id="modalTitle">Add New Tutorial Video</h3>
                    <button className="modal-close" onClick={closeAddModal}><i className="fas fa-times"></i></button>
                </div>
                <div className="modal-body">
                    <form id="videoForm" onSubmit={handleAddSubmit}>
                        <div className="form-group">
                            <label><i className="fas fa-upload"></i> Upload from Gallery/Device</label>
                            <input type="file" className="form-control" accept="video/*" onChange={e => setFormFile(e.target.files?.[0] || null)} style={{ padding: '8px' }} required />
                            <small style={{color: '#718096'}}>Select a video file directly from your computer or mobile gallery.</small>
                        </div>
                        <div className="form-group">
                            <label><i className="fas fa-heading"></i> Title</label>
                            <input type="text" className="form-control" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g., How to Book an Appointment" required />
                        </div>
                        <div className="form-group">
                            <label><i className="fas fa-align-left"></i> Description</label>
                            <textarea className="form-control" rows={3} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Brief description of this tutorial..."></textarea>
                        </div>
                    </form>
                </div>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={closeAddModal}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleAddSubmit}>Save Video</button>
                </div>
            </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal" style={{display: 'flex'}} onClick={(e) => { if(e.target === e.currentTarget) closeEditModal() }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3 id="modalTitle">Edit Tutorial Video</h3>
                    <button className="modal-close" onClick={closeEditModal}><i className="fas fa-times"></i></button>
                </div>
                <div className="modal-body">
                    <form id="videoEditForm" onSubmit={handleEditSubmit}>
                        <div className="form-group">
                            <label><i className="fas fa-upload"></i> Upload from Gallery/Device (Replace Current)</label>
                            <input type="file" className="form-control" accept="video/*" onChange={e => setFormFile(e.target.files?.[0] || null)} style={{ padding: '8px' }} />
                        </div>
                        <div className="form-group">
                            <label><i className="fas fa-heading"></i> Title</label>
                            <input type="text" className="form-control" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g., How to Book an Appointment" required />
                        </div>
                        <div className="form-group">
                            <label><i className="fas fa-align-left"></i> Description</label>
                            <textarea className="form-control" rows={3} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Brief description of this tutorial..."></textarea>
                        </div>
                    </form>
                </div>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleEditSubmit}>Update Video</button>
                </div>
            </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal" style={{display: 'flex'}} onClick={(e) => { if(e.target === e.currentTarget) setIsDeleteModalOpen(false) }}>
            <div className="modal-content" style={{maxWidth: '400px'}}>
                <div className="modal-header">
                    <h3>Confirm Delete</h3>
                    <button className="modal-close" onClick={() => setIsDeleteModalOpen(false)}><i className="fas fa-times"></i></button>
                </div>
                <div className="modal-body">
                    <p>Are you sure you want to delete this tutorial video? This action cannot be undone.</p>
                </div>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                    <button className="btn btn-primary" style={{background: '#fc8181'}} onClick={confirmDelete}>Delete</button>
                </div>
            </div>
        </div>
      )}

      {isWatchModalOpen && activeVideo && (
        <div className="modal" style={{display: 'flex'}} onClick={(e) => { if(e.target === e.currentTarget) setIsWatchModalOpen(false) }}>
            <div className="modal-content" style={{maxWidth: '800px'}}>
                <div className="modal-header">
                    <h3>{activeVideo.title}</h3>
                    <button className="modal-close" onClick={() => setIsWatchModalOpen(false)}><i className="fas fa-times"></i></button>
                </div>
                <div className="modal-body">
                    <div style={{position: 'relative', paddingBottom: '56.25%', height: '0', overflow: 'hidden', background: '#000'}}>
                        {activeVideo.isLocal ? (
                          <video src={activeVideo.url} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} controls autoPlay></video>
                        ) : (
                          <iframe style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} src={activeVideo.url} frameBorder={0} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        )}
                    </div>
                    <p style={{marginTop: '15px', color: '#4a5568'}}>{activeVideo.description}</p>
                </div>
                <div className="modal-actions">
                    <button className="btn btn-primary" onClick={() => setIsWatchModalOpen(false)}>Close</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}
