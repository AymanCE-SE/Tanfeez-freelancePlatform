import React from "react";
import { Button } from "react-bootstrap";
import { Search, ThreeDots } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";

const formatLastSeen = (isoString) => {
  if (!isoString) return "Offline";
  const diffMinutes = Math.floor((Date.now() - new Date(isoString)) / 60000);
  if (diffMinutes < 1) return "Last seen just now";
  if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;
  return `Last seen ${new Date(isoString).toLocaleString()}`;
};

const ChatHeader = ({ participant, presence, projectName, onBack }) => {
  const navigate = useNavigate();

  return (
    <div className="chat-header">
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          {/* Back button — only rendered on mobile (passed in by Chat.jsx) */}
          {onBack && (
            <Button variant="link" className="text-dark p-0 me-2 d-md-none" onClick={onBack}>
              <ArrowLeft size={22} />
            </Button>
          )}

          <div
            className="position-relative me-3"
            role="button"
            onClick={() => participant.id && navigate(`/profile/${participant.id}`)}
            title="View profile">
            <img src={participant.avatar} alt={participant.name}
              className="rounded-circle" width="48" height="48"
              style={{ objectFit: "cover" }} />
            {presence?.online && (
              <span className="position-absolute bottom-0 end-0 bg-success rounded-circle p-1 border border-white"></span>
            )}
          </div>

          <div
            role="button"
            onClick={() => participant.id && navigate(`/profile/${participant.id}`)}
            title="View profile">
            <h6 className="mb-0 chat-header-title">{participant.name}</h6>
            {projectName && <small className="text-muted d-block">Re: {projectName}</small>}
            <small className={presence?.online ? "text-success" : "text-muted"}>
              {presence?.online ? "Online" : formatLastSeen(presence?.lastSeen)}
            </small>
          </div>
        </div>
        <div>
          <Button variant="light" className="rounded-circle p-2 me-2"><Search /></Button>
          <Button variant="light" className="rounded-circle p-2"><ThreeDots /></Button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;