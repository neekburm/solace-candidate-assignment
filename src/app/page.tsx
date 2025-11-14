"use client";

import React, { useEffect, useState } from "react";
import { Advocate } from "../types/Advocate"

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchAdvocates = async () => {
      setLoading(true);
      try {
        const url = `/api/advocates?page=${currentPage}&limit=${limit}${debouncedSearchTerm ? `&search=${encodeURIComponent(debouncedSearchTerm)}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details ?? errorData.error ?? `HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();
        setAdvocates(jsonResponse.data);
        setTotal(jsonResponse.pagination.total);
        setTotalPages(jsonResponse.pagination.totalPages);
      }
      catch (err: any) {
        console.error("Error fetching advocates:", err);
        setError(err?.message ?? "Unknown error");
      }
      finally {
        setLoading(false);
      }
    };

    fetchAdvocates();
  }, [currentPage, debouncedSearchTerm, limit]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const resetSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);

    return (
      <main style={{ margin: "24px" }}>
        <h1>Solace Advocates</h1>
        <br />
        <br />

        <div>
          <p>Search</p>
          <p>
            Searching for: <span>{searchTerm}</span>
          </p>
          <input
            style={{ border: "1px solid black" }}
            value={searchTerm}
            onChange={onSearchChange}
          />
          <button onClick={resetSearch}>Reset Search</button>
        </div>
        <br />
        <br />

        {loading && <p>Loading advocates...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {!loading && !error && (
          <>
            <table>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>City</th>
                  <th>Degree</th>
                  <th>Specialties</th>
                  <th>Years of Experience</th>
                  <th>Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {advocates.map((advocate: Advocate) => {
                  return (
                    <tr key={advocate.id}>
                      <td>{advocate.firstName}</td>
                      <td>{advocate.lastName}</td>
                      <td>{advocate.city}</td>
                      <td>{advocate.degree}</td>
                      <td>
                        {advocate.specialties.map((s: string, idx: number) => (
                          <div key={idx}>{s}</div>
                        ))}
                      </td>
                      <td>{advocate.yearsOfExperience}</td>
                      <td>{advocate.phoneNumber}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination controls */}
            <p>Showing {advocates.length} of {total} advocates</p>
            <br />
            <div>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span style={{ margin: "0 16px" }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    );
  }
}