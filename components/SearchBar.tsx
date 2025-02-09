// components/SearchBar.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Send the transaction hash request to the FastAPI backend
      const response = await axios.get(`/api/transaction/${searchInput}`);
      
      if (response.status === 200) {
        // If the response is OK, redirect to the transaction details page
        router.push(`/transaction/${searchInput}`);
      } else {
        // Handle errors if the transaction is not found
        console.error("Transaction not found");
        alert("Transaction not found. Please check the transaction hash.");
      }
    } catch (error) {
      // Handle any error from the backend or network issues
      console.error("Error fetching transaction details:", error);
      alert("Error fetching transaction details. Please try again later.");
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Enter transaction hash"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;

