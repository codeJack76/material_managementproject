'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiOutlineRefresh, HiOutlineDownload } from 'react-icons/hi';
import HistoryTable from '@/app/components/history/HistoryTable';
import HistoryFilters from '@/app/components/history/HistoryFilters';
import { Modal } from '@/app/components/ui/Modal';
import { DeleteConfirmModal } from '@/app/components/ui/DeleteConfirmModal';
import { Pagination } from '@/app/components/ui/Pagination';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function HistoryPage() {
  const [completedIssuances, setCompletedIssuances] = useState<CompletedIssuance[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIssuance, setSelectedIssuance] = useState<CompletedIssuance | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    schoolId: '',
    materialId: '',
    startDate: '',
    endDate: '',
  });

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.schoolId) params.append('schoolId', filters.schoolId);
      if (filters.materialId) params.append('materialId', filters.materialId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/history?${params}`);
      const data = await response.json();

      if (data.success && data.data) {
        setCompletedIssuances(data.data.completedIssuances || []);
        if (data.data.pagination) {
          setPagination(data.data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch history:' , error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async () => {
    if (!selectedIssuance) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/history/${selectedIssuance.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setShowDeleteModal(false);
        setSelectedIssuance(null);
        fetchHistory();
        alert('Record deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.schoolId) params.append('schoolId', filters.schoolId);
    if (filters.materialId) params.append('materialId', filters.materialId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    window.open(`/api/export/history?${params}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Issue Items</h1>
          <p className="text-gray-600">View completed issuances and delivery records</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HiOutlineDownload className="h-5 w-5" />
            Export CSV
          </button>
          <button
            onClick={() => fetchHistory()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HiOutlineRefresh className="h-5 w-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <HistoryFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Records</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Items Delivered</p>
          <p className="text-2xl font-bold text-green-600">
            {completedIssuances.reduce((sum, i) => sum + i.quantity, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Schools Served</p>
          <p className="text-2xl font-bold text-blue-600">
            {new Set(completedIssuances.map((i) => i.school.id)).size}
          </p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <HistoryTable
            completedIssuances={completedIssuances}
            onView={(issuance) => {
              setSelectedIssuance(issuance);
              setShowViewModal(true);
            }}
            onDelete={(issuance) => {
              setSelectedIssuance(issuance);
              setShowDeleteModal(true);
            }}
          />

          {pagination.totalPages > 1 && (
          <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
            />
          )}
        </>
      )}

      {/* View Details Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Delivery Details">
        {selectedIssuance && (
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Material</p>
                  <p className="font-medium">{selectedIssuance.material.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium">{selectedIssuance.material.subject.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Grade Level</p>
                  <p className="font-medium">{selectedIssuance.material.gradeLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Education Stage</p>
                  <p className="font-medium">{selectedIssuance.material.educationStage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">School</p>
                  <p className="font-medium">{selectedIssuance.school.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Municipality</p>
                  <p className="font-medium">{selectedIssuance.school.municipality}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Congressional District</p>
                  <p className="font-medium">District {selectedIssuance.school.congressionalDistrict}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity Delivered</p>
                  <p className="font-medium">{selectedIssuance.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Issued</p>
                  <p className="font-medium" suppressHydrationWarning>
                    {new Date(selectedIssuance.dateIssued).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Delivered</p>
                  <p className="font-medium" suppressHydrationWarning>
                    {new Date(selectedIssuance.deliveredAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {selectedIssuance.remarks && (
                <div>
                  <p className="text-sm text-gray-500">Remarks</p>
                  <p className="font-medium mt-1 p-3 bg-gray-50 rounded-lg">
                    {selectedIssuance.remarks}
                  </p>
                </div>
              )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedIssuance(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedIssuance && (
        <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedIssuance(null); }} title="Delete History Record">
          <DeleteConfirmModal
            title="Delete History Record"
            message="Are you sure you want to delete this delivery record?"
            itemName={`${selectedIssuance.material.title} - ${selectedIssuance.school.name}`}
            onConfirm={handleDelete}
            onCancel={() => { setShowDeleteModal(false); setSelectedIssuance(null); }}
            isDeleting={isDeleting}
          />
        </Modal>
      )}
    </div>
  );
}
