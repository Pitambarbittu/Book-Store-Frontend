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
  }, []); // The empty dependency array let us know the function is created only once

   // Use useEffect to fetch books when the component mounts
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]); // Depend on fetchBooks so it re-runs if fetchBooks changes

  // Providing the books data and fetchBooks function to child components
  return (
    <BookContext.Provider value={{ books, fetchBooks }}>
      {children}
    </BookContext.Provider>
  );
};

// Again using Custom hook to use the BookContext easily in other components
export const useBook = () => useContext(BookContext);
