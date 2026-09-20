"use client";

import React, { useState, useEffect } from 'react';
import './feedback.css';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks || []);
      }
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Calculate stats
  const totalReviews = feedbacks.length;
  const averageRating = totalReviews > 0 
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  feedbacks.forEach(f => {
    const r = f.rating;
    const current = ratingCounts[r];
    if (current !== undefined) {
      ratingCounts[r] = current + 1;
    }
  });

  const ratingPercentages: Record<number, number> = {
    5: totalReviews > 0 ? ((ratingCounts[5] ?? 0) / totalReviews) * 100 : 0,
    4: totalReviews > 0 ? ((ratingCounts[4] ?? 0) / totalReviews) * 100 : 0,
    3: totalReviews > 0 ? ((ratingCounts[3] ?? 0) / totalReviews) * 100 : 0,
    2: totalReviews > 0 ? ((ratingCounts[2] ?? 0) / totalReviews) * 100 : 0,
    1: totalReviews > 0 ? ((ratingCounts[1] ?? 0) / totalReviews) * 100 : 0,
  };

  // Helper to parse comments
  const parseFeedback = (rawComments: string) => {
    let category = "Other";
    let comment = rawComments || "";
    if (comment.startsWith("[")) {
      const endIdx = comment.indexOf("]");
      if (endIdx > -1) {
        category = comment.substring(1, endIdx);
        comment = comment.substring(endIdx + 1).trim();
      }
    }
    return { category, comment };
  };

  // Helper to render stars
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fas fa-star" style={{ color: '#ecc94b', marginRight: '2px' }}></i>);
      } else {
        stars.push(<i key={i} className="far fa-star" style={{ color: '#cbd5e0', marginRight: '2px' }}></i>);
      }
    }
    return stars;
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setIsReplying(true);
    setTimeout(() => {
      setIsReplying(false);
      setReplyText('');
      setSelectedFeedback(null);
      setSuccessMessage("Reply sent successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1000);
  };

  return (
    <>
      <div className="module-content">
        <div className="section-container" style={{ width: '100%' }}>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px 20px 10px 20px' }}>
                <h1 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '30px', fontWeight: 'bold', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                    <i className="fas fa-comments" style={{ color: '#2E5E3E' }}></i> User Feedback
                </h1>
                <button className="btn-secondary" onClick={fetchFeedbacks} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>
                    <i className="fas fa-sync-alt"></i> Refresh
                </button>
            </div>

            {successMessage && (
              <div style={{ background: '#C6F6D5', color: '#22543D', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>
                {successMessage}
              </div>
            )}
            
            <div className="feedback-container-wrapper" style={{ display: 'flex', flexDirection: 'row', gap: '30px', alignItems: 'flex-start' }}>
                <style>{`
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    .category-badge {
                      display: inline-block;
                      padding: 2px 8px;
                      border-radius: 12px;
                      font-size: 0.75rem;
                      font-weight: 600;
                      margin-top: 4px;
                    }
                    .badge-clinic { background: #EBF8FF; color: '#2B6CB0'; }
                    .badge-app { background: #FED7D7; color: '#C53030'; }
                    .badge-suggestion { background: #EAF3DE; color: '#2D5016'; }
                    .badge-products { background: #FEF3C7; color: '#B7791F'; }
                    .badge-other { background: #EDF2F7; color: '#4A5568'; }
                `}</style>
                
                {/* Left Side: Feedbacks */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '600px' }}>
                    <div className="feedback-container-title" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#4a5568', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-inbox" style={{ color: '#a0aec0' }}></i> All Feedbacks
                        <span id="feedbackCount" style={{ background: '#2E5E3E', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{totalReviews}</span>
                    </div>

                    <div className="feedback-list hide-scrollbar" id="feedbackList" style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
                        {loading ? (
                          <p style={{ color: '#a0aec0', textAlign: 'center', padding: '40px 0' }}>Loading feedback...</p>
                        ) : feedbacks.length === 0 ? (
                          <p style={{ color: '#a0aec0', textAlign: 'center', padding: '40px 0' }}>No feedback available.</p>
                        ) : (
                          feedbacks.map((f) => {
                            const { category, comment } = parseFeedback(f.comments);
                            const categoryClass = category.toLowerCase().includes('clinic') ? 'badge-clinic' :
                                                  category.toLowerCase().includes('app') ? 'badge-app' :
                                                  category.toLowerCase().includes('suggest') ? 'badge-suggestion' :
                                                  category.toLowerCase().includes('product') ? 'badge-products' : 'badge-other';
                            return (
                              <div 
                                className="feedback-card" 
                                key={f.id} 
                                style={{ 
                                  background: 'white', 
                                  border: '1px solid #edf2f7', 
                                  borderRadius: '12px', 
                                  padding: '16px', 
                                  marginBottom: '15px',
                                  cursor: 'pointer' 
                                }}
                                onClick={() => setSelectedFeedback(f)}
                              >
                                <div className="feedback-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                  <div className="feedback-user" style={{ display: 'flex', gap: '12px' }}>
                                    <div className="feedback-avatar" style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4A5568' }}>
                                      {(f.user?.fullName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="feedback-user-info">
                                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#2d3748' }}>{f.user?.fullName || 'Anonymous User'}</h4>
                                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#718096' }}>{f.user?.email || 'No email provided'}</p>
                                    </div>
                                  </div>
                                  <div className="feedback-rating">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      {renderStars(f.rating)}
                                    </div>
                                    <span className={`category-badge ${categoryClass}`} style={{ alignSelf: 'flex-end', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                                      {category}
                                    </span>
                                  </div>
                                </div>
                                <p className="feedback-text" style={{ color: '#4a5568', fontSize: '0.9rem', margin: '10px 0', lineHeight: 1.5 }}>
                                  {comment}
                                </p>
                                <div className="feedback-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#a0aec0' }}>
                                  <span>{new Date(f.submittedAt).toLocaleDateString()} at {new Date(f.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                    </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: '1px', background: '#edf2f7', alignSelf: 'stretch' }}></div>

                {/* Right Side: Rating Summary */}
                <div style={{ width: '350px', flexShrink: 0, position: 'sticky', top: '20px' }}>
                    <div className="rating-summary-card" id="ratingSummaryCard" style={{ background: '#f7fafc', padding: '30px 24px', borderRadius: '16px' }}>
                        <div className="rating-summary-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '35px', alignItems: 'center' }}>
                            
                            <div className="rating-overall" style={{ textAlign: 'center', width: '100%' }}>
                                <div className="rating-summary-title" style={{ color: '#718096', marginBottom: '10px', fontSize: '1rem' }}>Overall Rating</div>
                                <div className="average-rating" id="averageRatingDisplay" style={{ fontSize: '4rem', fontWeight: 'bold', color: '#2d3748', lineHeight: 1 }}>{averageRating}</div>
                                <div className="rating-stars-large" id="averageStarsDisplay" style={{ color: '#ecc94b', fontSize: '1.5rem', margin: '15px 0' }}>
                                  {renderStars(Math.round(parseFloat(averageRating)))}
                                </div>
                                <div className="rating-stats-text" id="ratingStatsText" style={{ color: '#a0aec0', fontSize: '0.95rem' }}>Based on {totalReviews} reviews</div>
                            </div>

                            <div className="rating-breakdown" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {[5, 4, 3, 2, 1].map(star => (
                                    <div className="rating-breakdown-item" key={star} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div className="rating-breakdown-label" style={{ minWidth: '35px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}><i className="fas fa-star" style={{ color: '#ecc94b' }}></i> {star}</div>
                                        <div className="rating-bar-container" style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div className="rating-bar-fill" id={`bar${star}`} style={{ width: `${ratingPercentages[star] ?? 0}%`, height: '100%', background: '#ecc94b', borderRadius: '4px' }}></div>
                                        </div>
                                        <div className="rating-breakdown-count" id={`count${star}`} style={{ minWidth: '20px', textAlign: 'right', color: '#718096', fontSize: '0.9rem' }}>{ratingCounts[star] ?? 0}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {selectedFeedback && (
        <div className="modal" id="viewFeedbackModal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-content" style={{ maxWidth: '500px', background: 'white', borderRadius: '16px', padding: '24px', width: '90%' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-comment-dots" style={{ color: '#2E5E3E' }}></i> Feedback Details</h3>
                    <button className="modal-close" onClick={() => setSelectedFeedback(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#a0aec0', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                </div>
                <div className="modal-body" id="feedbackDetailBody" style={{ color: '#4a5568', lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '22.5px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4A5568', fontSize: '1.1rem' }}>
                      {(selectedFeedback.user?.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#2d3748' }}>{selectedFeedback.user?.fullName || 'Anonymous User'}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>{selectedFeedback.user?.email || 'No email'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                    <div>{renderStars(selectedFeedback.rating)}</div>
                    <span className="category-badge badge-other" style={{ margin: 0 }}>
                      {parseFeedback(selectedFeedback.comments).category}
                    </span>
                  </div>
                  <p style={{ background: '#f7fafc', padding: '15px', borderRadius: '8px', color: '#4a5568', fontSize: '0.95rem' }}>
                    {parseFeedback(selectedFeedback.comments).comment}
                  </p>
                  
                  <div style={{ marginTop: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '8px', fontSize: '0.9rem' }}>Reply Message</label>
                    <textarea 
                      style={{ width: '100%', height: '100px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px', fontSize: '0.9rem', color: '#2d3748', resize: 'none' }}
                      placeholder="Type your response here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
                    <button className="btn-secondary" onClick={() => setSelectedFeedback(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#edf2f7', color: '#4a5568', cursor: 'pointer', fontWeight: 600 }}>Close</button>
                    <button className="btn-primary" onClick={handleSendReply} disabled={isReplying} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2E5E3E', color: 'white', cursor: 'pointer', fontWeight: 600, opacity: isReplying ? 0.7 : 1 }}>
                      {isReplying ? 'Sending...' : 'Send Reply'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}
