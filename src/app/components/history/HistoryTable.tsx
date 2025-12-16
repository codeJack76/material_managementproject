'use client';

import { HiOutlineEye, HiOutlineTrash } from 'react-icons/hi';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

interface Material {
  id: string;
  title: string;
  gradeLevel: string;
  educationStage: string;
  subject: {
    name: string;
  };
}

interface School {
  id: string;
  name: string;
  municipality: string;
  congressionalDistrict: number;
}

interface CompletedIssuance {
  id: string;
  quantity: number;
  dateIssued: string;
  deliveredAt: string;
  remarks: string | null;
  material: Material;
  school: School;
}

interface HistoryTableProps {
  completedIssuances: CompletedIssuance[];
  onView: (issuance: CompletedIssuance) => void;
  onDelete: (issuance: CompletedIssuance) => void;
  isLoading?: boolean;
}

export default function HistoryTable({
  completedIssuances,
  onView,
  onDelete,
  isLoading = false,
}: HistoryTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-t border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (completedIssuances.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No completed issuances found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Material
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Issued
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Delivered
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {completedIssuances.map((issuance) => (
              <tr key={issuance.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {issuance.material.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {issuance.material.subject.name} • Grade {issuance.material.gradeLevel}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {issuance.school.schoolname}
                  </div>
                  <div className="text-sm text-gray-500">
                    {issuance.school.municipality} • District {issuance.school.congressionalDistrict}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{issuance.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(issuance.dateIssued)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(issuance.deliveredAt)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {issuance.remarks || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(issuance)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="View Details"
                    >
                      <HiOutlineEye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(issuance)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete Record"
                    >
                      <HiOutlineTrash className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
