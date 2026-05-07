"use client";

import React, { useState } from 'react';
import './feedbacks.css';

export default function FeedbacksPage() {
    const [feedbacks, setFeedbacks] = useState([
        { id: 1, user: "John Doe", email: "john@example.com", rating: 5, date: "2023-10-25", text: "Great service and very friendly staff. My dog loves coming here!" },
        { id: 2, user: "Jane Smith", email: "jane@example.com", rating: 4, date: "2023-10-24", text: "Very professional, but the waiting time was a bit long." },
        { id: 3, user: "Mike Johnson", email: "mike@example.com", rating: 5, date: "2023-10-22", text: "Dr. Sarah was amazing with my cat. Highly recommended!" },
    ]);

    const averageRating = (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1);

    const counts = [5, 4, 3, 2, 1].map(star => feedbacks.filter(f => f.rating === star).length);

    return (
        <div className="feedback-page-container">
            <div className="feedback-page-header">
                <h2><i className="fas fa-comments" style={{color: '#2E5E3E'}}></i> User Feedback</h2>
                <button className="btn-secondary" onClick={() => window.location.reload()}>
                    <i className="fas fa-sync-alt"></i> Refresh
                </button>
            </div>

            <div className="feedback-container-wrapper">
                <div className="feedback-container-title">
                    <i className="fas fa-inbox"></i> All Feedbacks
                    <span>{feedbacks.length}</span>
                </div>

                <div className="rating-summary-card">
                    <div className="rating-summary-wrapper">
                        <div className="rating-overall">
                            <div className="rating-summary-title">Overall Rating</div>
                            <div className="average-rating">{averageRating}</div>
                            <div className="rating-stars-large">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className={i < Math.round(Number(averageRating)) ? "fas fa-star" : "far fa-star"}></i>
                                ))}
                            </div>
                            <div className="rating-stats-text">Based on {feedbacks.length} reviews</div>
                        </div>

                        <div className="rating-breakdown">
                            {[5, 4, 3, 2, 1].map((star, idx) => {
                                const count = counts[idx];
                                const percentage = feedbacks.length > 0 ? (count! / feedbacks.length) * 100 : 0;
                                return (
                                    <div className="rating-breakdown-item" key={star}>
                                        <div className="rating-breakdown-label"><i className="fas fa-star"></i> {star}</div>
                                        <div className="rating-bar-container">
                                            <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        <div className="rating-breakdown-count">{count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="feedback-grid">
                    {feedbacks.map(fb => (
                        <div className="feedback-card" key={fb.id}>
                            <div className="feedback-header">
                                <div className="feedback-user">
                                    <div className="feedback-avatar">
                                        {fb.user.charAt(0)}
                                    </div>
                                    <div className="feedback-user-info">
                                        <h4>{fb.user}</h4>
                                        <p>{fb.email}</p>
                                    </div>
                                </div>
                                <div className="feedback-rating">
                                    {[...Array(5)].map((_, i) => (
                                        <i key={i} className={i < fb.rating ? "fas fa-star" : "far fa-star"}></i>
                                    ))}
                                </div>
                            </div>
                            <div className="feedback-text">
                                "{fb.text}"
                            </div>
                            <div className="feedback-meta">
                                <span><i className="far fa-calendar-alt"></i> {fb.date}</span>
                                <button className="btn-secondary" style={{padding: '4px 10px', fontSize: '0.8rem'}}>Reply</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
