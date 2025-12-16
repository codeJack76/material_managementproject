'use client';

import { useState, useEffect, useMemo } from 'react';
import { HiOutlineX } from 'react-icons/hi';

interface Material {
  id: string;
  title?: string;
  name?: string;
  gradeLevel: string | number;
  educationStage: string;
  quantity: number;
  subject?: {
    name: string;
  } | null;
}

interface School {
  id: string;
  name: string;
  municipality: string;
  schooltype?: string;
}

interface IssuanceFormProps {
  onSubmit: (data: { materialId: string; schoolId: string; quantity: number }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function IssuanceForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: IssuanceFormProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [materialId, setMaterialId] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [municipalityFilter, setMunicipalityFilter] = useState('');
  const [schoolTypeFilter, setSchoolTypeFilter] = useState('');
  
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get unique municipalities for filter dropdown
  const municipalities = useMemo(() => {
    const unique = [...new Set(schools.map((s) => s.municipality))];
    return unique.sort();
  }, [schools]);

  // Get unique school types for filter dropdown
  const schoolTypes = useMemo(() => {
    const unique = [...new Set(schools.map((s) => s.schooltype).filter(Boolean))];
    return unique.sort();
  }, [schools]);

  // Filter schools based on selected filters
  const filteredSchools = useMemo(() => {
    let filtered = schools;
    if (municipalityFilter) {
      filtered = filtered.filter((s) => s.municipality === municipalityFilter);
    }
    if (schoolTypeFilter) {
      filtered = filtered.filter((s) => s.schooltype === schoolTypeFilter);
    }
    return filtered;
  }, [schools, municipalityFilter, schoolTypeFilter]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [materialsRes, schoolsRes] = await Promise.all([
        fetch('/api/materials?limit=1000'),
        fetch('/api/schools?limit=1000'),
      ]);
      
      const materialsData = await materialsRes.json();
      const schoolsData = await schoolsRes.json();
      
      if (materialsData.success) {
        // Handle both formats: data array directly or data.materials
        const materialsList = Array.isArray(materialsData.data) 
          ? materialsData.data 
          : (materialsData.data?.materials || []);
        setMaterials(materialsList);
      }
      if (schoolsData.success) {
        // Handle both formats: data array directly or data.schools
        const schoolsList = Array.isArray(schoolsData.data) 
          ? schoolsData.data 
          : (schoolsData.data?.schools || []);
        // Transform schoolname to name for frontend
        setSchools(schoolsList.map((s: { id: string; schoolname?: string; name?: string; municipality: string; schooltype?: string }) => ({
          id: s.id,
          name: s.schoolname || s.name || '',
          municipality: s.municipality,
          schooltype: s.schooltype,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleMaterialChange = (id: string) => {
    setMaterialId(id);
    const material = materials.find(m => m.id === id);
    setSelectedMaterial(material || null);
    setQuantity(1);
    if (errors.materialId) {
      setErrors(prev => ({ ...prev, materialId: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!materialId) {
      newErrors.materialId = 'Please select a material';
    }
    if (!schoolId) {
      newErrors.schoolId = 'Please select a school';
    }
    if (quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (selectedMaterial && quantity > selectedMaterial.quantity) {
      newErrors.quantity = `Only ${selectedMaterial.quantity} items available`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    await onSubmit({ materialId, schoolId, quantity });
  };

  if (loadingData) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Issue Material to School</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <HiOutlineX className="h-6 w-6" />
        </button>
      </div> */}

      {/* Material Selection */}
      <div>
        <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
          Material <span className="text-red-500">*</span>
        </label>
        <select
          id="material"
          value={materialId}
          onChange={(e) => handleMaterialChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.materialId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a material</option>
          {materials.map((material) => (
            <option key={material.id} value={material.id} disabled={material.quantity === 0}>
              {material.title || material.name} - Grade {material.gradeLevel} ({material.quantity} available)
            </option>
          ))}
        </select>
        {errors.materialId && (
          <p className="mt-1 text-sm text-red-500">{errors.materialId}</p>
        )}
        {selectedMaterial && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{selectedMaterial.title || selectedMaterial.name}</strong>
            </p>
            <p className="text-xs text-blue-600">
              {selectedMaterial.subject?.name || 'No subject'} • Grade {selectedMaterial.gradeLevel} • {selectedMaterial.educationStage?.replace('_', ' ')}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Available: <strong>{selectedMaterial.quantity}</strong> items
            </p>
          </div>
        )}
      </div>

      {/* School Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          School <span className="text-red-500">*</span>
        </label>
        
        {/* School Filters */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select
            value={municipalityFilter}
            onChange={(e) => {
              setMunicipalityFilter(e.target.value);
              setSchoolId(''); // Reset school selection when filter changes
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Municipalities</option>
            {municipalities.map((municipality) => (
              <option key={municipality} value={municipality}>
                {municipality}
              </option>
            ))}
          </select>
          <select
            value={schoolTypeFilter}
            onChange={(e) => {
              setSchoolTypeFilter(e.target.value);
              setSchoolId(''); // Reset school selection when filter changes
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All School Types</option>
            {schoolTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <select
          id="school"
          value={schoolId}
          onChange={(e) => {
            setSchoolId(e.target.value);
            if (errors.schoolId) {
              setErrors(prev => ({ ...prev, schoolId: '' }));
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.schoolId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a school</option>
          {filteredSchools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name} - {school.municipality}
            </option>
          ))}
        </select>
        {filteredSchools.length === 0 && (municipalityFilter || schoolTypeFilter) && (
          <p className="mt-1 text-sm text-amber-600">No schools found with the selected filters</p>
        )}
        {(municipalityFilter || schoolTypeFilter) && filteredSchools.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            Showing {filteredSchools.length} of {schools.length} schools
          </p>
        )}
        {errors.schoolId && (
          <p className="mt-1 text-sm text-red-500">{errors.schoolId}</p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Quantity <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="quantity"
          min={1}
          max={selectedMaterial?.quantity || 1}
          value={quantity}
          onChange={(e) => {
            setQuantity(parseInt(e.target.value) || 1);
            if (errors.quantity) {
              setErrors(prev => ({ ...prev, quantity: '' }));
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.quantity ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.quantity && (
          <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Issuing...' : 'Issue Material'}
        </button>
      </div>
    </form>
  );
}
