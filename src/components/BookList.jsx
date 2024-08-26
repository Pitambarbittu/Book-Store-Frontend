import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Alert,
  Button,
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_BACKEND_URI;

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // State to track which book is being deleted
  const [loggingOut, setLoggingOut] = useState(false); // State to track logging out status
  const navigate = useNavigate();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Unauthorized. Please log in again.");
        setError(true);
        setTimeout(() => {
          localStorage.removeItem("token");
          navigate("/login");
        }, 1000); // Refresh after 1 second and redirect to the login page
        return;
      }

      const response = await axios.get(`${API_URL}/api/v1/books`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setBooks(response.data.data);
        setSuccess(true);
        setMessage("");
      } else {
        setSuccess(false);
        setMessage(response.data.msg);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setSuccess(false);
      setMessage("Failed to fetch books. Please try again.");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id); // Set the deleting book ID
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Unauthorized. Please log in.");
        setError(true);
        return;
      }

      const response = await axios.delete(`${API_URL}/api/v1/books/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setBooks((prevBooks) => prevBooks.filter((book) => book._id !== id));
        setSuccess(true);
        setMessage("Book deleted successfully!");
        setTimeout(() => setMessage(""), 2000);
      } else {
        setSuccess(false);
        setMessage(response.data.msg);
      }
    } catch (err) {
      console.error("Error deleting book:", err);
      setSuccess(false);
      setMessage("Failed to delete book. Please try again.");
      setError(true);
    } finally {
      setDeletingId(null); // Reset the deleting book ID
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true); // Set logging out status
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        `${API_URL}/api/v1/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err);
      setMessage("Failed to log out. Please try again.");
      setError(true);
    } finally {
      setLoggingOut(false); // Reset logging out status
    }
  };

  const handleBack = () => {
    fetchBooks();
    navigate("/books");
  };

  return (
    <Container fluid className="bg-dark text-white min-vh-100 py-5">
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand href="#">Book Store</Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Link href="/login">Login</Nav.Link>
            <Nav.Link href="/">Register</Nav.Link>
            <Button
              onClick={handleLogout}
              variant="danger"
              className="ml-2"
              disabled={loggingOut} // Disable button if logging out
            >
              {loggingOut ? "Logging out..." : "Logout"} {/* Update button text */}
            </Button>
          </Nav>
        </Container>
      </Navbar>
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <h2 className="text-center">All Books</h2>
          </div>
          {message && (
            <Alert variant={success ? "success" : "danger"} className="mb-4">
              {message}
            </Alert>
          )}
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Loading books...</p>
            </div>
          ) : books.length > 0 ? (
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Gender</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.gender}</td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(book._id)}
                        disabled={deletingId === book._id} // Disable button if this book is being deleted
                      >
                        {deletingId === book._id ? "Deleting..." : "Delete"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center">
              No books available. Please add some books first.
            </p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default BookList;
