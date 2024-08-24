import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";

const API_URL = process.env.REACT_APP_BACKEND_URI;

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/v1/auth/register`, { email, password });
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("user alredy exist, try with different email id");
      }
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <Container className="bg-dark text-white min-vh-100 d-flex justify-content-center align-items-center">
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <h2 className="text-center mb-4">Register</h2>
          <Form onSubmit={handleSubmit} className="bg-secondary p-4 rounded">
            {errorMessage && (
              <Alert variant="danger" className="mb-3">
                {errorMessage}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100 mb-2">
              Register
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-100"
              onClick={handleLogin}
            >
              Login
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
