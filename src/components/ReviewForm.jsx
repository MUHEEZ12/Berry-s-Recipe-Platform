import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { FiStar } from "react-icons/fi";
import "./ReviewForm.css";

function ReviewForm({ recipeId, onReviewSubmit, existingReview }) {
  const { user, token } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="review-form login-prompt">
        <p>📝 Please log in to leave a review</p>
        <small>Reviews are private to you but help other users decide</small>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (rating === 0) {
      setError("Please select a rating");
      setLoading(false);
      return;
    }

    try {
      if (!token) {
        throw new Error('Authentication token missing. Please login again.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/recipes/${recipeId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setRating(0);
      setComment("");
      onReviewSubmit?.(data.data);
    } catch (err) {
      setError(err.message || "Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form">
      <h3 className="form-title">
        {existingReview ? "✏️ Update Your Review" : "⭐ Leave a Review"}
      </h3>

      <div className="review-info-box">
        <p className="info-title"><strong>📝 How Reviews Work:</strong></p>
        <ul className="info-list">
          <li>Your reviews are <strong>private</strong> - Only you can see them</li>
          <li>Your star rating counts toward the recipe's <strong>average rating</strong></li>
          <li>Comments should be <strong>helpful and respectful</strong></li>
          <li>You can <strong>edit anytime</strong> with new thoughts</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Rating Stars */}
        <div className="rating-selector">
          <p className="rating-label">Rate this recipe:</p>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${
                  star <= (hoverRating || rating) ? "active" : ""
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <FiStar size={24} fill={star <= (hoverRating || rating) ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="rating-text">
              You rated: <strong>{rating} out of 5 stars</strong>
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="comment-section">
          <label htmlFor="comment">Your review (optional)</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this recipe..."
            rows="4"
            maxLength="500"
          />
          <p className="char-count">{comment.length}/500</p>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;
