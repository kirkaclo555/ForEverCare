"use client";

import React, { useState } from 'react';
import './feedback.css';

export default function FeedbackPage() {
  return (
    <>
      <div className="module-content">
        <div className="section-container" style={{ width: '100%' }}>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-comments" style={{ color: '#2E5E3E' }}></i> User Feedback</h2>
                <button className="btn-secondary" onClick={() => console.log('refreshFeedback()')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                    <i className="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
            
            <div className="feedback-container-wrapper">
                <div className="feedback-container-title" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#4a5568', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-inbox" style={{ color: '#a0aec0' }}></i> All Feedbacks
                    <span id="feedbackCount" style={{ background: '#2E5E3E', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>0</span>
                </div>

                <div className="rating-summary-card" id="ratingSummaryCard" style={{ background: '#f7fafc', padding: '24px', borderRadius: '16px', marginBottom: '30px' }}>
                    <div className="rating-summary-wrapper" style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                        
                        <div className="rating-overall" style={{ textAlign: 'center', minWidth: '150px' }}>
                            <div className="rating-summary-title" style={{ color: '#718096', marginBottom: '10px' }}>Overall Rating</div>
                            <div className="average-rating" id="averageRatingDisplay" style={{ fontSize: '3rem', fontWeight: 'bold', color: '#2d3748', lineHeight: 1 }}>0.0</div>
                            <div className="rating-stars-large" id="averageStarsDisplay" style={{ color: '#ecc94b', fontSize: '1.2rem', margin: '10px 0' }}>
                                <i className="far fa-star"></i><i className="far fa-star"></i><i className="far fa-star"></i><i className="far fa-star"></i><i className="far fa-star"></i>
                            </div>
                            <div className="rating-stats-text" id="ratingStatsText" style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Based on 0 reviews</div>
                        </div>

                        <div className="rating-breakdown" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[5, 4, 3, 2, 1].map(star => (
                                <div className="rating-breakdown-item" key={star} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div className="rating-breakdown-label" style={{ minWidth: '35px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-star" style={{ color: '#ecc94b' }}></i> {star}</div>
                                    <div className="rating-bar-container" style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div className="rating-bar-fill" id={`bar${star}`} style={{ width: '0%', height: '100%', background: '#ecc94b', borderRadius: '4px' }}></div>
                                    </div>
                                    <div className="rating-breakdown-count" id={`count${star}`} style={{ minWidth: '20px', textAlign: 'right', color: '#718096', fontSize: '0.9rem' }}>0</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="feedback-list" id="feedbackList">
                    <p style={{ color: '#a0aec0', textAlign: 'center', padding: '40px 0' }}>No feedback available.</p>
                </div>
            </div>
        </div>
      </div>

      <div className="modal" id="viewFeedbackModal" onClick={() => console.log('if(event.target === this) closeViewFeedbackModal()')} style={{ display: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '500px', background: 'white', borderRadius: '16px', padding: '24px', width: '90%' }}>
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-comment-dots" style={{ color: '#2E5E3E' }}></i> Feedback Details</h3>
                  <button className="modal-close" onClick={() => console.log('closeViewFeedbackModal()')} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#a0aec0', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body" id="feedbackDetailBody" style={{ color: '#4a5568', lineHeight: 1.6 }}></div>
              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
                  <button className="btn-secondary" onClick={() => console.log('closeViewFeedbackModal()')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#edf2f7', color: '#4a5568', cursor: 'pointer', fontWeight: 600 }}>Close</button>
                  <button className="btn-primary" onClick={() => console.log('sendReply()')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2E5E3E', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Send Reply</button>
              </div>
          </div>
      </div>
    </>
  );
}
