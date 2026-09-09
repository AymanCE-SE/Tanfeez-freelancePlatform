import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { Search, ThreeDots, ArrowLeft } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { updateServiceProposal } from "../../api/serviceProposal";

const formatLastSeen = (isoString) => {
  if (!isoString) return "Offline";
  const diffMinutes = Math.floor((Date.now() - new Date(isoString)) / 60000);
  if (diffMinutes < 1) return "Last seen just now";
  if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;
  return `Last seen ${new Date(isoString).toLocaleString()}`;
};

  const ChatHeader = ({ participant, presence, projectName, onBack, serviceProposal, canEditOffer, onOfferUpdated }) => {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [priceOffer, setPriceOffer] = useState(serviceProposal?.price_offer || "");
  const [message, setMessage] = useState(serviceProposal?.message || "");
  const [saving, setSaving] = useState(false);
  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateServiceProposal(serviceProposal.id, { price_offer: priceOffer, message });
      setShowEditModal(false);
      onOfferUpdated?.();
      Swal.fire({ icon: "success", title: "Offer Updated", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Failed", text: "Could not update your offer. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // Once the freelancer accepts, the offer is locked — editing it after
  // acceptance would silently change terms both sides already agreed to.
  const canStillEdit = canEditOffer && serviceProposal && !serviceProposal.is_approved;

  return (
    <div className="chat-header">
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          {onBack && (
            <Button variant="link" className="text-dark p-0 me-2 d-md-none" onClick={onBack}>
              <ArrowLeft size={22} />
            </Button>
          )}
          <div className="position-relative me-3" role="button"
            onClick={() => participant.id && navigate(`/profile/${participant.id}`)} title="View profile">
            <img src={participant.avatar} alt={participant.name}
              className="rounded-circle" width="48" height="48" style={{ objectFit: "cover" }} />
            {presence?.online && (
              <span className="position-absolute bottom-0 end-0 bg-success rounded-circle p-1 border border-white"></span>
            )}
          </div>
          <div role="button" onClick={() => participant.id && navigate(`/profile/${participant.id}`)} title="View profile">
            <h6 className="mb-0 chat-header-title">{participant.name}</h6>
            {projectName && <small className="text-muted d-block">Re: {projectName}</small>}
            <small className={presence?.online ? "text-success" : "text-muted"}>
              {presence?.online ? "Online" : formatLastSeen(presence?.lastSeen)}
            </small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {canStillEdit && (
            <Button variant="outline-primary" size="sm" onClick={() => setShowEditModal(true)}>
              Edit Offer (${serviceProposal.price_offer})
            </Button>
          )}
          <Button variant="light" className="rounded-circle p-2"><Search /></Button>
          <Button variant="light" className="rounded-circle p-2"><ThreeDots /></Button>
        </div>
      </div>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton><Modal.Title>Edit Your Offer</Modal.Title></Modal.Header>
        <Form onSubmit={handleUpdateOffer}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Your offer ($)</Form.Label>
              <Form.Control type="number" min="1" value={priceOffer}
                onChange={(e) => setPriceOffer(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control as="textarea" rows={3} value={message}
                onChange={(e) => setMessage(e.target.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Offer"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ChatHeader;