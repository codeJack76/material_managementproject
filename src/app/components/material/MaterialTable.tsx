"use client";

import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCube,
} from "react-icons/hi";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Pagination } from "@/app/components/ui/Pagination";

interface Material {
  id: string;
  name: string;
  gradeLevel: number;
  quantity: number;
  source: string | null;
  subjectId: string;
  subject: {
    id: string;
    name: string;
    educationStage: string;
  };
}

interface MaterialTableProps {
  materials: Material[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
  isLoading: boolean;
}

export function MaterialTable({
  materials,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  isLoading,
}: MaterialTableProps) {
  const getEducationStageBadge = (stage: string) => {
    const colors: Record<string, string> = {
      ELEMENTARY: "bg-green-100 text-green-700",
      JUNIOR_HIGH: "bg-blue-100 text-blue-700",
      SENIOR_HIGH: "bg-purple-100 text-purple-700",
    };
    const labels: Record<string, string> = {
      ELEMENTARY: "Elementary",
      JUNIOR_HIGH: "Junior High",
      SENIOR_HIGH: "Senior High",
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[stage] || "bg-gray-100 text-gray-700"}`}
      >
        {labels[stage] || stage}
      </span>
    );
  };

  const getQuantityBadge = (quantity: number) => {
    if (quantity === 0) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
          Out of Stock
        </span>
      );
    }
    if (quantity <= 50) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
          Low Stock
        </span>
      );
    }
    return (
      <span className="text-sm font-medium text-gray-900">
        {quantity.toLocaleString()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <EmptyState
          icon={<HiOutlineCube className="w-8 h-8" />}
          title="No materials found"
          description="Get started by adding your first learning resource to the inventory."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Material Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials.map((material) => (
              <tr
                key={material.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{material.name}</p>
                    {getEducationStageBadge(material.subject.educationStage)}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {material.subject.name}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                    {material.gradeLevel}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {getQuantityBadge(material.quantity)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {material.source || "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(material)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit material"
                    >
                      <HiOutlinePencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(material)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete material"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
      />
    </div>
  );
}
