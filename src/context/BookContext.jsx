import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
const API_URL = process.env.REACT_APP_BACKEND_URI;

const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);

  const fetchBooks = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/book`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setBooks(response.data.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return (
    <BookContext.Provider value={{ books, fetchBooks }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBook = () => useContext(BookContext);
