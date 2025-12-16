'use client';

import { useState } from 'react';

interface Material {
  id: string;
  title: string;
  gradeLevel: string;
  educationStage: string;
}

interface School {
  id: string;
  name: string;
  municipality: string;
}

interface Issuance {
  id: string;
  quantity: number;
  dateIssued: string;
  status: string;
  material: Material;
  school: School;
  remarks?: string;
}

interface EditIssuanceFormProps {
  issuance: Issuance;
  onSubmit: (data: { quantity: number; remarks?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EditIssuanceForm({
  issuance,
  onSubmit,
  onCancel,
  isLoading = false,
}: EditIssuanceFormProps) {
  const [quantity, setQuantity] = useState(issuance.quantity);
  const [remarks, setRemarks] = useState(issuance.remarks || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    onSubmit({ quantity, remarks: remarks || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Material Info (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Material
        </label>
        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
          {issuance.material.title}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Grade {issuance.material.gradeLevel} • {issuance.material.educationStage?.replace('_', ' ')}
        </p>
      </div>

      {/* School Info (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          School
        </label>
        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
          {issuance.school.name}
        </div>
        <p className="text-xs text-gray-500 mt-1">{issuance.school.municipality}</p>
      </div>

      {/* Quantity (Editable) */}
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Quantity *
        </label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Remarks (Editable) */}
      <div>
        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
          Remarks
        </label>
        <textarea
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Optional notes or comments..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
