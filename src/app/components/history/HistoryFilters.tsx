'use client';

import { useState, useEffect } from 'react';

interface School {
  id: string;
  name: string;
}

interface Material {
  id: string;
  title: string;
}

interface HistoryFiltersProps {
  filters: {
    search: string;
    schoolId: string;
    materialId: string;
    startDate: string;
    endDate: string;
  };
  onFiltersChange: (filters: HistoryFiltersProps['filters']) => void;
}

export default function HistoryFilters({ filters, onFiltersChange }: HistoryFiltersProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilterData();
  }, []);

  const fetchFilterData = async () => {
    try {
      const [schoolsRes, materialsRes] = await Promise.all([
        fetch('/api/schools?limit=1000'),
        fetch('/api/materials?limit=1000'),
      ]);

      const schoolsData = await schoolsRes.json();
      const materialsData = await materialsRes.json();

      if (schoolsData.success) {
        // Handle both formats: data.schools or data (array directly)
        const schoolsList = Array.isArray(schoolsData.data) 
          ? schoolsData.data 
          : (schoolsData.data?.schools || []);
        // Transform schoolname to name for frontend
        setSchools(schoolsList.map((s: { id: string; schoolname?: string; name?: string }) => ({
          id: s.id,
          name: s.schoolname || s.name || '',
        })));
      }
      if (materialsData.success) {
        // Handle both formats: data.materials or data (array directly)
        const materialsList = Array.isArray(materialsData.data) 
          ? materialsData.data 
          : (materialsData.data?.materials || []);
        setMaterials(materialsList.map((m: { id: string; title?: string; name?: string }) => ({
          id: m.id,
          title: m.title || m.name || '',
        })));
      }
    } catch (error) {
      console.error('Failed to fetch filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof typeof filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClear = () => {
    onFiltersChange({
      search: '',
      schoolId: '',
      materialId: '',
      startDate: '',
      endDate: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search materials, schools..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* School Filter */}
        <div>
          <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
            School
          </label>
          <select
            id="school"
            value={filters.schoolId}
            onChange={(e) => handleChange('schoolId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">All Schools</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.schoolname}
              </option>
            ))}
          </select>
        </div>

        {/* Material Filter */}
        <div>
          <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
            Material
          </label>
          <select
            id="material"
            value={filters.materialId}
            onChange={(e) => handleChange('materialId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">All Materials</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.title}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            id="endDate"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClear}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
