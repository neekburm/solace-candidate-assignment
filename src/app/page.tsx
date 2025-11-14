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

  const [sortField, setSortField] = useState<keyof Advocate | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
  };

  const handleSort = (field: keyof Advocate) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAdvocates = [...advocates].sort((a, b) => {
    if (!sortField) return 0;
    
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const startIndex = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, total);

  const goToPreviousPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  return (
    <main className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Solace Advocates</h1>
      
      <div className="mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Search</label>
          <input 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            placeholder="Search by name, city, degree, specialty, or years..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
        <button 
          onClick={resetSearch}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>
      
      {loading && <p className="text-gray-600">Loading advocates...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('firstName')}
                  >
                    First Name {sortField === 'firstName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('lastName')}
                  >
                    Last Name {sortField === 'lastName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('city')}
                  >
                    City {sortField === 'city' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('degree')}
                  >
                    Degree {sortField === 'degree' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialties
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('yearsOfExperience')}
                  >
                    Experience {sortField === 'yearsOfExperience' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAdvocates.map((advocate: Advocate) => {
                  return (
                    <tr key={advocate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{advocate.firstName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{advocate.lastName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{advocate.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{advocate.degree}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {advocate.specialties.map((s: string, idx: number) => (
                            <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{advocate.yearsOfExperience}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{advocate.phoneNumber}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing advocates {startIndex}-{endIndex} of {total}
            </p>
            <div className="flex gap-2 items-center">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
