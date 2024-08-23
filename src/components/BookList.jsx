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
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_BACKEND_URI;

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [bookToUpdate, setBookToUpdate] = useState(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setMessage("Unauthorized. Please log in.");
          setError(true);
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
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
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
    }
  };

  const handleUpdate = (book) => {
    setBookToUpdate(book);
    navigate(`/update-book/${book._id}`);
  };

  const handleLogout = async () => {
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
    }
  };

  return (
    <Container fluid className="bg-dark text-white min-vh-100 py-5">
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand href="#">Book Store</Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Link href="/login">Login</Nav.Link>
            <Nav.Link href="/">Register</Nav.Link>
            <Button onClick={handleLogout} variant="danger" className="ml-2">
              Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button variant="secondary" onClick={() => navigate("/books")}>
              Back
            </Button>
            <h2 className="text-center">All Books</h2>
          </div>
          {message && (
            <Alert variant={success ? "success" : "danger"} className="mb-4">
              {message}
            </Alert>
          )}
          {books.length > 0 ? (
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
                        variant="info"
                        // className="mr-4"
                        style={{ marginRight: "15px" }}
                        onClick={() => handleUpdate(book)}
                      >
                        Update
                      </Button>
                      <Button
                        variant="danger"
                        className="mr-2"
                        onClick={() => handleDelete(book._id)}
                      >
                        Delete
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
