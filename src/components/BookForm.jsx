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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
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
          // Filter books by user ID
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Unauthorized. Please log in.");
        setError(true);
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
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Unauthorized. Please log in.");
      setError(true);
      return;
    }

    try {
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
    }
  };

  const handleViewAllBooks = () => {
    navigate("/all-books");
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(`${API_URL}/api/v1/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err);
      setMessage("Failed to log out. Please try again.");
      setError(true);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="bg-dark text-white min-vh-100 py-5">
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand href="#">Book Store</Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Link href="/login">Login</Nav.Link>
            <Nav.Link href="/">Register</Nav.Link>
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
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Button
        onClick={handleLogout}
        variant="danger"
        className="position-fixed bottom-0 end-0 m-3"
      >
        Logout
      </Button>
    </Container>
  );
};

export default BookForm;
