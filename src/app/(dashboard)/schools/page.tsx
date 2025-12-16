"use client";

import { useState, useCallback, useEffect } from "react";
import { SchoolTable } from "@/app/components/school/SchoolTable";
import { SchoolFilters } from "@/app/components/school/SchoolFilters";

interface School {
  id: string;
  schoolname: string;
  schooltype: "ELEMENTARY" | "SECONDARY" | "INTEGRATED";
  municipality: string;
  congressionalDistrict: number;
  zone: string | null;
  _count: {
    issuances: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    municipality: "",
    congressionalDistrict: "",
  });

  // Fetch schools
  const fetchSchools = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.municipality && { municipality: filters.municipality }),
        ...(filters.congressionalDistrict && {
          congressionalDistrict: filters.congressionalDistrict,
        }),
      });

      const response = await fetch(`/api/schools?${params}`);
      const data = await response.json();

      if (data.success) {
        setSchools(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
          <p className="text-gray-500 mt-1">
            View school records and information
          </p>
        </div>
      </div>

      {/* Filters */}
      <SchoolFilters onFilterChange={handleFilterChange} />

      {/* Table */}
      <SchoolTable
        schools={schools}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </div>
  );
}
