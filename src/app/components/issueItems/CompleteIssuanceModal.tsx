'use client';

import { useState } from 'react';
import { HiOutlineCheckCircle } from 'react-icons/hi';

const formatDateForInput = (date: Date) => {
  return date.toISOString().split('T')[0];
};

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
}

interface CompleteIssuanceModalProps {
  issuance: Issuance;
  onComplete: (data: { remarks?: string; deliveredAt?: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CompleteIssuanceModal({
  issuance,
  onComplete,
  onCancel,
  isLoading = false,
}: CompleteIssuanceModalProps) {
  const [remarks, setRemarks] = useState('');
  const [deliveredAt, setDeliveredAt] = useState(formatDateForInput(new Date()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onComplete({ remarks: remarks || undefined, deliveredAt });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 z-[10000]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Issuance</h3>

          {/* Issuance Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm"><strong>Material:</strong> {issuance.material.title}</p>
            <p className="text-sm"><strong>School:</strong> {issuance.school.name}</p>
            <p className="text-sm"><strong>Quantity:</strong> {issuance.quantity}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Delivery Date */}
            <div>
              <label htmlFor="deliveredAt" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                id="deliveredAt"
                value={deliveredAt}
                onChange={(e) => setDeliveredAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Remarks */}
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                Remarks (Optional)
              </label>
              <textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Add notes..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <HiOutlineCheckCircle className="h-5 w-5" />
                {isLoading ? 'Completing...' : 'Mark as Completed'}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}
