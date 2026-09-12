import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { createServiceProposal } from '../../api/serviceProposal';
import { Link } from "react-router-dom";

export default function PricingBox({ price, serviceId, isOwnService, orderStatus, onOrderSuccess }) {
  const { user } = useSelector((myStore) => myStore.authSlice);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [priceOffer, setPriceOffer] = useState(price);
  const [submitting, setSubmitting] = useState(false);

 const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createServiceProposal({ service: serviceId, message, price_offer: priceOffer });
      setShowModal(false);
      onOrderSuccess();
      Swal.fire({ icon: 'success', title: 'Order Sent', text: 'Your order has been sent to the freelancer.', timer: 2000, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Order Failed', text: error?.response?.data?.detail || error?.response?.data?.[0] || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };


  // "pending" | "approved" | "completed" | null (never ordered)
  const buttonLabelByStatus = {
    pending: "Order Sent — Awaiting Response",
    approved: "Order Accepted — In Progress",
    completed: "Order Completed",
  };

  return (
    <>
      <Card className="shadow-sm p-4 border-0 mb-3" style={{ background: '#f8fffa' }}>
        <h4 className="fw-bold mb-3 color-inverse">${price} <span className="fw-normal fs-6 text-secondary">USD</span></h4>
        <div className="mb-3 text-muted" style={{ fontSize: '1.01rem' }}>Standard Package</div>
        <ul className="mb-3 ps-3 color-inverse">
          <li>Logo Design & Source Files</li>
          <li>Up to 3 Concepts</li>
          <li>Unlimited Revisions</li>
        </ul>

        {isOwnService ? (
          <Button as={Link} to={`/services/${serviceId}/requests`} variant="primary" size="lg" className="w-100 fw-semibold">
            Manage Orders
          </Button>
        ) : (
          user?.user_type === 'client' && (
            <Button
              variant={orderStatus === "completed" ? "outline-secondary" : "success"}
              size="lg"
              className="w-100 fw-semibold"
              disabled={Boolean(orderStatus)}
              onClick={() => setShowModal(true)}
            >
              {orderStatus ? buttonLabelByStatus[orderStatus] : `Continue ($${price})`}
            </Button>
          )
        )}
        <div className="text-center mt-2 text-secondary" style={{ fontSize: 12 }}>
          Secure payment · Delivered through Tanfeez
        </div>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Order This Service</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Message to the freelancer</Form.Label>
              <Form.Control as="textarea" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell them what you need..." />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Your offer ($)</Form.Label>
              <Form.Control type="number" value={priceOffer} onChange={(e) => setPriceOffer(e.target.value)} min="1" required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="success" type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Order'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}