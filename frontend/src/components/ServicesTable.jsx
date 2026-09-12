import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Spinner, Badge } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import '../styles/tableStyles.css';
import { getAllServicesAction, deleteServiceAction } from "../store/slices/adminSlice";
import ServiceDetailsModal from "./ServiceDetailsModal";

const ServicesTable = () => {
  const dispatch = useDispatch();
  const { services, isLoading } = useSelector((state) => state.adminSlice);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

    // filter services nnot deleted
  const filteredServices = services?.filter(service => !service.is_deleted);
  useEffect(() => {
    dispatch(getAllServicesAction());

  }, [dispatch]);

  const handleShowDetails = (service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
    
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This service will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) {
        await dispatch(deleteServiceAction(id)).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: "Service has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        // Refresh the services list
        dispatch(getAllServicesAction());
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error?.message || "Failed to delete service. Please try again.",
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
      <div className="text-center mb-4">
        <Button
          className="btn-add"
          onClick={() => {/* Add service navigation */ }}
        >
          <FaPlus className="me-1" />
          Add Service
        </Button>
      </div>

      <Table className="admin-table" bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Service Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Freelancer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredServices?.map((service) => (
            <tr key={service.id}>
              <td>{service.id}</td>
              <td>
                <div className="d-flex align-items-center">
                  {service.photo && (
                    <img
                      src={service.photo}
                      alt={service.service_name}
                      style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                        marginRight: '10px',
                        borderRadius: '4px'
                      }}
                    />
                  )}
                  {service.service_name}
                </div>
              </td>
              <td>
                <Badge bg="primary">{service.category}</Badge>
              </td>
              <td>${parseFloat(service.price).toLocaleString()}</td>
              <td>{service.freelancerId?.user_name}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShowDetails(service)}
                >
                  View Details
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(service.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {services?.length === 0 && (
        <div className="text-center p-5">
          <p className="text-muted">No services found</p>
        </div>
      )}

      <ServiceDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        service={selectedService}
      />
    </div>
  );
};

export default ServicesTable;
