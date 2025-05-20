import React from 'react';

function RecommendationSection({ recommendation, loading, requestDecision }) {
  return (
    <>
      {/* Get Decision Button */}
      <div className="mb-6 text-center">
        <button
          onClick={requestDecision}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Loading...' : 'Get Bot Decision'}
        </button>
      </div>
      
      {/* Recommendation Display */}
      {recommendation && (
        <div className="recommendation mb-6">
          <h2 className="mb-2">Recommended Action</h2>
          {recommendation.error ? (
            <p>{recommendation.error}</p>
          ) : (
            <div className="text-center">
              <p className="action mb-2">
                {recommendation.action.toUpperCase()}
                {recommendation.amount > 0 && ` ${recommendation.amount}`}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default RecommendationSection;
