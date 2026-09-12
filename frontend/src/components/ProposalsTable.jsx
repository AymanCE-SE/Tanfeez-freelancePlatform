import { useState, useEffect } from "react";
import { Table, Button, Spinner, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { getAllProposalsAction, deleteProposalAction } from "../store/slices/adminSlice";
import ProposalDetailsModal from "./ProposalDetailsModal";

import '../styles/tableStyles.css';

const ProposalsTable = () => {
  const dispatch = useDispatch();
  const { proposals, isLoading } = useSelector((state) => state.adminSlice);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    dispatch(getAllProposalsAction());
  }, [dispatch]);

  const handleShowDetails = (proposal) => {
    setSelectedProposal(proposal);
    setShowDetailsModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This proposal will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) {
        await dispatch(deleteProposalAction(id)).unwrap();

        // Refresh the proposals list after successful deletion
        await dispatch(getAllProposalsAction());

        Swal.fire({
          title: "Deleted!",
          text: "Proposal has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error?.message || "Failed to delete proposal. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="admin-table-container p-3">
      <Table className="admin-table" striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Project</th>
            <th>Bid Price</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {proposals?.map((proposal) => (
            <tr key={proposal.id}>
              <td>{proposal.id}</td>
              <td>{proposal.project?.name}</td>
              <td>${proposal.bid_price}</td>
              <td>{proposal.days_to_finish} days</td>
              <td>
                <Badge bg={proposal.is_approved ? 'success' : 'warning'}>
                  {proposal.is_approved ? 'Approved' : 'Pending'}
                </Badge>
              </td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShowDetails(proposal)}
                >
                  View Details
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(proposal.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {proposals?.length === 0 && (
        <div className="text-center p-5">
          <p className="text-muted">No proposals found</p>
        </div>
      )}

      <ProposalDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        proposal={selectedProposal}
      />
    </div>
  );
};

export default ProposalsTable;
