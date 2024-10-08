import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Table,
  Button,
  Form,
  Spinner,
  Container,
  Row,
  Col,
  Navbar,
  Nav,
} from "react-bootstrap";

const API_URL = process.env.REACT_APP_BACKEND_URI;

const BookForm = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [gender, setGender] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // State to track which book is being deleted
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const userId = JSON.parse(atob(token.split(".")[1])).userId;

        const response = await axios.get(`${API_URL}/api/v1/books`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const userBooks = response.data.data.filter(
            (book) => book.userId === userId
          );
          setBooks(userBooks);
        } else {
          setError(response.data.msg);
        }
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to fetch books. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Unauthorized. Please log in again.");
        setError(true);
        setTimeout(() => {
          localStorage.removeItem("token");
          navigate("/");
        }, 1000); // Refresh after 1 second and redirecting to the login page
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/v1/books`,
        { title, author, gender },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setMessage("Book added successfully!");
        setTitle("");
        setAuthor("");
        setGender("");

        const newBook = response.data.data;
        setBooks((prevBooks) => [...prevBooks, newBook]);

        setTimeout(() => setMessage(""), 2000);
      } else {
        setSuccess(false);
        setMessage(response.data.msg);
      }
    } catch (err) {
      console.error("Error adding book:", err);
      setSuccess(false);
      setMessage("Failed to add book. Please try again.");
      setError(true);
    }
  };

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
        setMessage("Book deleted successfully!");
        setSuccess(true);
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

  const handleViewAllBooks = () => {
    navigate("/all-books");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
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
      navigate("/");
    } catch (err) {
      console.error("Error logging out:", err);
      setMessage("Failed to log out. Please try again.");
      setError(true);
    } finally {
      setLoggingOut(false)
    }
  };

  if (loading) {
    return (
      <div
        style={{ gap: "10px" }}
        className="d-flex justify-content-center align-items-center min-vh-100 bg-dark text-white"
      >
        <Spinner animation="border" variant="primary" />
        <p className="ml-3" style={{ margin: "0px" }}>
          Loading Book Store ...
        </p>
      </div>
    );
  }

  return (
    <Container fluid className="bg-dark text-white min-vh-100 py-5">
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand href="#">Book Store</Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Link href="/">Login</Nav.Link>
            <Nav.Link href="/register">Register</Nav.Link>
            <Button
              onClick={handleLogout}
              variant="danger"
              className="ml-2"
              disabled={loggingOut} // Disable button if logging out
            >
              {loggingOut ? "Logging out..." : "Logout"}
              {/* Update button text */}
            </Button>
          </Nav>
        </Container>
      </Navbar>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h2 className="text-center mb-4">Add a New Book</h2>
          {message && (
            <Alert variant={success ? "success" : "danger"} className="mb-4">
              {message}
            </Alert>
          )}
          <Form onSubmit={handleSubmit} className="mt-4">
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter book title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Author</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter book author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Control
                as="select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Control>
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="primary" type="submit">
                Add Book
              </Button>
              <Button onClick={handleViewAllBooks} variant="secondary">
                View All Books
              </Button>
            </div>
          </Form>

          <h3 className="mt-5">Books List</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Table striped bordered hover variant="dark" className="mt-3">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Gender</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    No books available
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.gender}</td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(book._id)}
                        disabled={deletingId === book._id} // Disable button if the book is being deleted
                      >
                        {deletingId === book._id ? (
                          <span>
                            <Spinner
                              animation="border"
                              variant="light"
                              size="sm"
                              className="mr-2"
                            />
                            Deleting...
                          </span>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default BookForm;
