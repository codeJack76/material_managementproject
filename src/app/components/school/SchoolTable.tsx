"use client";

import {
  HiOutlineAcademicCap,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Pagination } from "@/app/components/ui/Pagination";

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

interface SchoolTableProps {
  schools: School[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export function SchoolTable({
  schools,
  pagination,
  onPageChange,
  isLoading,
}: SchoolTableProps) {
  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      ELEMENTARY: "bg-green-100 text-green-700",
      SECONDARY: "bg-blue-100 text-blue-700",
      INTEGRATED: "bg-purple-100 text-purple-700",
    };
    const labels: Record<string, string> = {
      ELEMENTARY: "Elementary",
      SECONDARY: "Secondary",
      INTEGRATED: "Integrated",
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[type] || "bg-gray-100 text-gray-700"}`}
      >
        {labels[type] || type}
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

  if (schools.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <EmptyState
          icon={<HiOutlineAcademicCap className="w-8 h-8" />}
          title="No schools found"
          description="Get started by adding your first school to the system."
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
                School Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Municipality
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Cong. Dist.
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Zone
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Issuances
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schools.map((school) => (
              <tr
                key={school.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <HiOutlineAcademicCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{school.schoolname}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getTypeBadge(school.schooltype)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <HiOutlineLocationMarker className="w-4 h-4" />
                    {school.municipality}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full">
                    {school.congressionalDistrict}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {school.zone || "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-medium text-gray-900">
                    {school._count.issuances}
                  </span>
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
