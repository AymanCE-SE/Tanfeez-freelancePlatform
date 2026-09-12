import { useState, useEffect } from "react";
import { Table, Modal, Button, Form, Spinner, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getAllProjectAction } from "../store/slices/projectSlice";
import { deleteProjectAction } from "../store/slices/adminSlice";
import '../styles/tableStyles.css';
import ProjectDetailsModal from "./ProjectDetailsModal";

const ProjectsTable = () => {
  const dispatch = useDispatch();
  const { projectList, isLoading } = useSelector((state) => state.projectSlice);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    dispatch(getAllProjectAction());
  }, [dispatch]);

  const handleShowDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = async (projectId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) {
        await dispatch(deleteProjectAction(projectId)).unwrap();

        Swal.fire({
          title: "Deleted!",
          text: "Project has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });

        // Refresh the projects list
        dispatch(getAllProjectAction());
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error?.message || "Failed to delete project. Please try again.",
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
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-1" />
          Add Project
        </Button>
      </div>

      <Table className="admin-table" striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Progress</th>
            <th>Experience Level</th>
            <th>Type</th>
            <th>Budget</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projectList?.map((project) => (
            <tr key={project.id}>
              <td>{project.name}</td>
              <td>{project.description}</td>
              <td>
                <Badge bg={getProgressBadgeColor(project.progress)}>
                  {project.progress}
                </Badge>
              </td>
              <td>{project.experience_level}</td>
              <td>{project.type}</td>
              <td>${project.budget}</td>
              <td>{project.duration} days</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShowDetails(project)}
                >
                  View Details
                </Button>
                {(
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(project.id)}
                  >
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {projectList?.length === 0 && (
        <div className="text-center p-5">
          <p className="text-muted">No projects found</p>
        </div>
      )}

      <ProjectDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        project={selectedProject}
      />
    </div>
  );
};

// Helper function for progress badge colors
const getProgressBadgeColor = (progress) => {
  switch (progress) {
    case 'not_started':
      return 'secondary';
    case 'in_progress':
      return 'primary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default ProjectsTable;
