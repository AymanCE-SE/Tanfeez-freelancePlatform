import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="notfound d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <img
        src="https://media.giphy.com/media/l2JehQ2GitHGdVG9y/giphy.gif"
        alt="Are you lost?"
        style={{ width: 360, maxWidth: "90%", marginBottom: 32 }}
      />
      <h1 className="text-danger mb-3">Are you lost?</h1>
      <p className="text-muted mb-4 fs-5">Oops! This page doesn't exist.<br />Let me take you home.</p>
      <Link to="/" className="btn btn-primary px-4 py-2">
        🏠 Take Me Home
      </Link>
    </div>
  );
}
