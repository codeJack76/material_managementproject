'use client';

import { HiOutlineCheckCircle, HiOutlineTrash, HiOutlineEye, HiOutlinePencil } from 'react-icons/hi';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
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
  schoolname?: string;
  municipality: string;
}

interface Issuance {
  id: string;
  quantity: number;
  dateIssued: string;
  issuedAt?: string;
  deliveredAt?: string;
  status: string;
  material: Material;
  school: School;
  remarks?: string;
}

interface IssuanceTableProps {
  issuances: Issuance[];
  onComplete: (issuance: Issuance) => void;
  onView: (issuance: Issuance) => void;
  onEdit?: (issuance: Issuance) => void;
  onDelete: (issuance: Issuance) => void;
  isLoading?: boolean;
  showEditDelete?: boolean;
}

export default function IssuanceTable({
  issuances,
  onComplete,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
  showEditDelete = true,
}: IssuanceTableProps) {
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

  if (issuances.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No pending issuances found.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

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
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {issuances.map((issuance) => (
              <tr key={issuance.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {issuance.material.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    Grade {issuance.material.gradeLevel} • {issuance.material.educationStage?.replace('_', ' ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {issuance.school.name || issuance.school.schoolname}
                  </div>
                  <div className="text-sm text-gray-500">
                    {issuance.school.municipality}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{issuance.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" suppressHydrationWarning>
                  <div className="text-sm text-gray-900">
                    {formatDate(issuance.dateIssued || issuance.issuedAt || '')}
                  </div>
                  {issuance.deliveredAt && (
                    <div className="text-xs text-gray-500">
                      Delivered: {formatDate(issuance.deliveredAt)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(issuance.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(issuance)}
                      className="text-gray-600 hover:text-gray-900 p-1"
                      title="View Details"
                    >
                      <HiOutlineEye className="h-5 w-5" />
                    </button>
                    {issuance.status === 'PENDING' && showEditDelete && (
                      <>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(issuance)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit"
                          >
                            <HiOutlinePencil className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => onComplete(issuance)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Mark as Completed"
                        >
                          <HiOutlineCheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onDelete(issuance)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                        </button>
                      </>
                    )}
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
