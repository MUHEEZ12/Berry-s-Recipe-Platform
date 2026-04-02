import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";
import "./ReviewSection.css";

function ReviewSection({ recipeId, initialReviews = [], onReviewsUpdate }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      updateReviews(initialReviews);
    }
  }, [initialReviews]);

  const updateReviews = (newReviews) => {
    setReviews(newReviews);
    if (newReviews.length > 0) {
      const total = newReviews.reduce((sum, r) => sum + r.rating, 0);
      setAverageRating((total / newReviews.length).toFixed(1));
      setTotalRatings(newReviews.length);
    } else {
      setAverageRating(0);
      setTotalRatings(0);
    }
    onReviewsUpdate?.({
      averageRating: newReviews.length > 0 ? (total / newReviews.length).toFixed(1) : 0,
      totalRatings: newReviews.length,
      reviews: newReviews,
    });
  };

  const handleReviewSubmit = (data) => {
    updateReviews(data.reviews);
  };

  const handleReviewDelete = (reviewId) => {
    const updatedReviews = reviews.filter((r) => String(r._id) !== reviewId);
    updateReviews(updatedReviews);
  };

  const handleHelpful = (reviewId, data) => {
    const updatedReviews = reviews.map((r) =>
      String(r._id) === reviewId ? { ...r, ...data } : r
    );
    setReviews(updatedReviews);
  };

  const handleUnhelpful = (reviewId, data) => {
    const updatedReviews = reviews.map((r) =>
      String(r._id) === reviewId ? { ...r, ...data } : r
    );
    setReviews(updatedReviews);
  };

  const getSortedReviews = () => {
    const sorted = [...reviews];
    if (sortBy === "recent") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "highest") {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "lowest") {
      sorted.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === "helpful") {
      sorted.sort((a, b) => b.helpful - a.helpful);
    }
    return sorted;
  };

  const userReview = user ? reviews.find((r) => String(r.userId) === String(user.id)) : null;

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`star ${i < Math.round(rating) ? "filled" : "empty"}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const ratingsDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }));

  return (
    <section className="review-section">
      <div className="review-container">
        {/* Rating Summary */}
        <div className="rating-summary">
          <div className="rating-overview">
            <div className="rating-main">
              <div className="rating-number">{averageRating}</div>
              <div className="rating-stars">{renderStars(averageRating)}</div>
              <p className="rating-count">Based on {totalRatings} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="rating-distribution">
              {ratingsDistribution.map((item) => (
                <div key={item.rating} className="distribution-row">
                  <span className="distribution-label">{item.rating} ★</span>
                  <div className="distribution-bar">
                    <div
                      className="bar-fill"
                      style={{
                        width: totalRatings > 0 ? `${(item.count / totalRatings) * 100}%` : "0%",
                      }}
                    ></div>
                  </div>
                  <span className="distribution-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review Form */}
        <ReviewForm
          recipeId={recipeId}
          onReviewSubmit={handleReviewSubmit}
          existingReview={userReview}
        />

        {/* Reviews List */}
        <div className="reviews-list-section">
          <div className="reviews-header">
            <h3>Reviews ({totalRatings})</h3>
            {totalRatings > 0 && (
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
                <option value="helpful">Most Helpful</option>
              </select>
            )}
          </div>

          {getSortedReviews().length > 0 ? (
            <div className="reviews-list">
              {getSortedReviews().map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  recipeId={recipeId}
                  onDelete={handleReviewDelete}
                  onHelpful={handleHelpful}
                  onUnhelpful={handleUnhelpful}
                />
              ))}
            </div>
          ) : (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review this recipe!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ReviewSection;
