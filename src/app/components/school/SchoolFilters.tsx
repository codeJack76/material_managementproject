"use client";

import { useState, useEffect } from "react";
import { HiOutlineSearch, HiOutlineFilter, HiOutlineX } from "react-icons/hi";

interface SchoolFiltersProps {
  onFilterChange: (filters: {
    search: string;
    type: string;
    municipality: string;
    congressionalDistrict: string;
  }) => void;
}

// Ilocos Norte municipalities
const MUNICIPALITIES = [
  "Adams",
  "Bacarra",
  "Badoc",
  "Bangui",
  "Banna",
  "Batac",
  "Burgos",
  "Carasi",
  "Currimao",
  "Dingras",
  "Dumalneg",
  "Laoag City",
  "Marcos",
  "Nueva Era",
  "Pagudpud",
  "Paoay",
  "Pasuquin",
  "Piddig",
  "Pinili",
  "San Nicolas",
  "Sarrat",
  "Solsona",
  "Vintar",
];

export function SchoolFilters({ onFilterChange }: SchoolFiltersProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [congressionalDistrict, setCongressionalDistrict] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, type, municipality, congressionalDistrict });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, type, municipality, congressionalDistrict, onFilterChange]);

  const clearFilters = () => {
    setSearch("");
    setType("");
    setMunicipality("");
    setCongressionalDistrict("");
  };

  const hasActiveFilters = type || municipality || congressionalDistrict;

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schools..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors
            ${
              showFilters || hasActiveFilters
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }
          `}
        >
          <HiOutlineFilter className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
              {[type, municipality, congressionalDistrict].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* School Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="ELEMENTARY">Elementary</option>
                <option value="SECONDARY">Secondary</option>
                <option value="INTEGRATED">Integrated</option>
              </select>
            </div>

            {/* Municipality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Municipality
              </label>
              <select
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Municipalities</option>
                {MUNICIPALITIES.map((mun) => (
                  <option key={mun} value={mun}>
                    {mun}
                  </option>
                ))}
              </select>
            </div>

            {/* Congressional District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Congressional District
              </label>
              <select
                value={congressionalDistrict}
                onChange={(e) => setCongressionalDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Districts</option>
                <option value="1">District 1</option>
                <option value="2">District 2</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <HiOutlineX className="w-4 h-4" />
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
