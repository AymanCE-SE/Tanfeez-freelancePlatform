import { useState, useEffect } from "react";
import { Table, Modal, Button, Form, Spinner, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FaPlus } from "react-icons/fa";
// import axios from "axios"; // Uncomment when using API
import '../styles/tableStyles.css'; // Add this line at the top of your component
import { useDispatch, useSelector } from "react-redux";
import { getAllUsersAction, deleteUserAction } from "../store/slices/userSlice";
import UserDetailsModal from './UserDetailsModal';

const MySwal = withReactContent(Swal);

const UsersTable = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", details: "" });
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const dispatch = useDispatch();


  const { users, isLoading } = useSelector((myStore) => myStore.userSlice);



  useEffect(() => {


    if (!users) {

      dispatch(getAllUsersAction()).unwrap()
    }







  }, [users]);

  const handleDelete = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "This user will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteUserAction(id)).unwrap();
          MySwal.fire("Deleted!", "User has been deleted.", "success");
          // Refresh the users list
          dispatch(getAllUsersAction());
        } catch (error) {
          MySwal.fire({
            icon: "error",
            title: "Delete Failed",
            text: error?.data?.detail || "Failed to delete user. Please try again.",
          });
        }
      }
    });
  };

  const handleShowAdd = () => {
    setFormData({ id: null, name: "", details: "" });
    setEditMode(false);
    setShowModal(true);
  };

  const handleShowEdit = (user) => {
    setFormData(user);
    setEditMode(true);
    setShowModal(true);
  };

  const handleShowDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.details) {
      MySwal.fire("Error", "Please fill in all fields.", "error");
      return;
    }

    if (editMode) {
      // Update existing
      setData((prev) =>
        prev.map((item) =>
          item.id === formData.id ? { ...formData } : item
        )
      );
      MySwal.fire("Updated!", "User has been updated.", "success");

    } else {
      // Add new
      const newUser = { ...formData, id: Date.now() };
      setData((prev) => [...prev, newUser]);
      MySwal.fire("Added!", "New user has been added.", "success");

    }

    setShowModal(false);
  };
  return (

    <div className="orders-container p-3">
      <div className="text-center mb-4">
        <Button
          style={{ backgroundColor: "#198754", border: "none" }}
          onClick={handleShowAdd}
        >
          <FaPlus className="me-1" />
          Add User
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Table className="orders-table" striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>User Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{`${user.first_name} ${user.second_name}`}</td>
                <td>{user.email}</td>
                <td>
                  <Badge bg={user.user_type === 'client' ? 'primary' : 'success'}>
                    {user.user_type}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowDetails(user)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Update the modal form to match the API data structure */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit User" : "Add User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter first name"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                value={formData.second_name || ''}
                onChange={(e) => setFormData({ ...formData, second_name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>User Type</Form.Label>
              <Form.Select
                value={formData.user_type || ''}
                onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
              >
                <option value="">Select user type</option>
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editMode ? "Save Changes" : "Add User"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add UserDetailsModal */}
      <UserDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersTable;

