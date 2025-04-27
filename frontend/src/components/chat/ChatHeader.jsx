/** @format */

import React from "react";
import { Button } from "react-bootstrap";
import { Search, ThreeDots } from "react-bootstrap-icons";

const ChatHeader = ({ participant }) => (
  <div className="chat-header">
    <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        <div className="position-relative me-3">
          <img
            src={participant.avatar}
            alt={participant.name}
            className="rounded-circle"
            width="48"
            height="48"
            style={{ objectFit: "cover" }}
          />
          <span className="position-absolute bottom-0 end-0 bg-success rounded-circle p-1 border border-white"></span>
        </div>
        <div>
          <h6 className="mb-0 chat-header-title">{participant.name}</h6>
          <small className="text-success">Online</small>
        </div>
      </div>
      <div>
        <Button variant="light" className="rounded-circle p-2 me-2">
          <Search />
        </Button>
        <Button variant="light" className="rounded-circle p-2">
          <ThreeDots />
        </Button>
      </div>
    </div>
  </div>
);

export default ChatHeader;
