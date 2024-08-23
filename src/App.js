import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";
import Register from "./components/Register";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/books" element={<PrivateRoute element={BookForm} />} />
        <Route
          path="/book-list"
          element={<PrivateRoute element={BookList} />}
        />
        <Route path="/all-books" element={<BookList />} />
      </Routes>
    </Router>
  );
};

export default App;
