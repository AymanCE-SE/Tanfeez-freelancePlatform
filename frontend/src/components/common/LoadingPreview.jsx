import React from "react";
import "../../styles/components/LoadingPreview.css";

const LoadingPreview = ({ variant = "cards", count = 3, label = "Loading content" }) => {
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <div
      className={`loading-preview loading-preview--${variant}`}
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <span className="visually-hidden">{label}</span>

      {variant === "cards" && (
        <div className="loading-preview__grid">
          {items.map((item) => (
            <div className="loading-preview__card" key={item} aria-hidden="true">
              <div className="loading-preview__bar loading-preview__bar--title" />
              <div className="loading-preview__bar loading-preview__bar--tag" />
              <div className="loading-preview__bar" />
              <div className="loading-preview__bar loading-preview__bar--short" />
              <div className="loading-preview__card-footer">
                <div className="loading-preview__bar loading-preview__bar--price" />
                <div className="loading-preview__bar loading-preview__bar--date" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "detail" && (
        <div className="loading-preview__detail" aria-hidden="true">
          <div className="loading-preview__detail-main">
            <div className="loading-preview__bar loading-preview__bar--eyebrow" />
            <div className="loading-preview__bar loading-preview__bar--heading" />
            <div className="loading-preview__bar" />
            <div className="loading-preview__bar" />
            <div className="loading-preview__bar loading-preview__bar--short" />
            <div className="loading-preview__detail-panel">
              <div className="loading-preview__bar loading-preview__bar--title" />
              <div className="loading-preview__bar" />
              <div className="loading-preview__bar loading-preview__bar--short" />
            </div>
          </div>
          <div className="loading-preview__detail-aside">
            <div className="loading-preview__bar loading-preview__bar--title" />
            <div className="loading-preview__bar loading-preview__bar--price" />
            <div className="loading-preview__bar" />
            <div className="loading-preview__bar loading-preview__bar--button" />
          </div>
        </div>
      )}

      {variant === "profile" && (
        <div className="loading-preview__profile" aria-hidden="true">
          <div className="loading-preview__profile-heading">
            <div className="loading-preview__avatar" />
            <div className="loading-preview__profile-copy">
              <div className="loading-preview__bar loading-preview__bar--heading" />
              <div className="loading-preview__bar loading-preview__bar--short" />
            </div>
          </div>
          <div className="loading-preview__profile-tabs">
            <div className="loading-preview__bar" />
            <div className="loading-preview__bar" />
            <div className="loading-preview__bar" />
          </div>
          <div className="loading-preview__detail-panel">
            <div className="loading-preview__bar loading-preview__bar--title" />
            <div className="loading-preview__bar" />
            <div className="loading-preview__bar" />
            <div className="loading-preview__bar loading-preview__bar--short" />
          </div>
        </div>
      )}

      {variant === "table" && (
        <div className="loading-preview__table" aria-hidden="true">
          {items.map((item) => (
            <div className="loading-preview__table-row" key={item}>
              {Array.from({ length: 5 }, (_, cell) => (
                <div className="loading-preview__bar" key={cell} />
              ))}
            </div>
          ))}
        </div>
      )}

      {variant === "list" && (
        <div className="loading-preview__list" aria-hidden="true">
          {items.map((item) => (
            <div className="loading-preview__list-row" key={item}>
              <div className="loading-preview__avatar" />
              <div className="loading-preview__list-copy">
                <div className="loading-preview__bar loading-preview__bar--title" />
                <div className="loading-preview__bar loading-preview__bar--short" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "chart" && (
        <div className="loading-preview__chart" aria-hidden="true">
          <div className="loading-preview__chart-grid">
            <div className="loading-preview__bar" />
            <div className="loading-preview__bar" />
            <div className="loading-preview__bar" />
          </div>
          <div className="loading-preview__chart-bars">
            {[42, 68, 51, 82, 60, 74, 48].map((height, index) => (
              <div className="loading-preview__chart-column" key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      )}

      {variant === "inline" && (
        <div className="loading-preview__bar loading-preview__bar--inline" aria-hidden="true" />
      )}
    </div>
  );
};

export default LoadingPreview;