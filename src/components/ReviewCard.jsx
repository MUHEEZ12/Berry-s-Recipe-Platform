import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { FiThumbsUp, FiThumbsDown, FiTrash2 } from "react-icons/fi";
import "./ReviewCard.css";

function ReviewCard({ review, recipeId, onDelete, onHelpful, onUnhelpful }) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const isOwner = user && String(user.id) === String(review.userId);

  const handleMarkHelpful = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/recipes/${recipeId}/reviews/${review._id}/helpful`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        onHelpful?.(review._id, data.data);
      }
    } catch (err) {
      console.error("Error marking helpful:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkUnhelpful = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/recipes/${recipeId}/reviews/${review._id}/unhelpful`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        onUnhelpful?.(review._id, data.data);
      }
    } catch (err) {
      console.error("Error marking unhelpful:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/recipes/${recipeId}/reviews/${review._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        onDelete?.(review._id);
      }
    } catch (err) {
      console.error("Error deleting review:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`star ${i < rating ? "filled" : "empty"}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">{review.userName?.charAt(0).toUpperCase() || "U"}</div>
          <div className="reviewer-details">
            <h4 className="reviewer-name">{review.userName}</h4>
            <p className="review-date">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        {isOwner && (
          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={loading}
            title="Delete review"
          >
            <FiTrash2 size={18} />
          </button>
        )}
      </div>

      <div className="review-rating">{renderStars(review.rating)}</div>

      {review.comment && <p className="review-comment">{review.comment}</p>}

      <div className="review-footer">
        <div className="helpful-section">
          <button
            className="helpful-btn"
            onClick={handleMarkHelpful}
            disabled={loading}
          >
            <FiThumbsUp size={16} />
            <span>Helpful ({review.helpful})</span>
          </button>
          <button
            className="unhelpful-btn"
            onClick={handleMarkUnhelpful}
            disabled={loading}
          >
            <FiThumbsDown size={16} />
            <span>Not helpful ({review.unhelpful})</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;
