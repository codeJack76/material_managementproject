'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiOutlinePlus, HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi';
import IssuanceTable from '@/app/components/issueItems/IssuanceTable';
import IssuanceForm from '@/app/components/issueItems/IssuanceForm';
import CompleteIssuanceModal from '@/app/components/issueItems/CompleteIssuanceModal';
import EditIssuanceForm from '@/app/components/issueItems/EditIssuanceForm';
import { Modal } from '@/app/components/ui/Modal';
import { DeleteConfirmModal } from '@/app/components/ui/DeleteConfirmModal';
import { Pagination } from '@/app/components/ui/Pagination';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function IssueItemsPage() {
  const [issuances, setIssuances] = useState<Issuance[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedIssuance, setSelectedIssuance] = useState<Issuance | null>(null);

  // Filter states
  const [schoolFilter, setSchoolFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch schools and materials for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [schoolsRes, materialsRes] = await Promise.all([
          fetch('/api/schools?limit=1000'),
          fetch('/api/materials?limit=1000'),
        ]);
        
        const schoolsData = await schoolsRes.json();
        const materialsData = await materialsRes.json();
        
        if (schoolsData.success) {
          setSchools(schoolsData.data.schools || []);
        }
        if (materialsData.success) {
          setMaterials(materialsData.data.materials || []);
        }
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      }
    };
    
    fetchFilterOptions();
  }, []);

  const fetchIssuances = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: 'PENDING', // Only fetch pending issuances
      });

      if (schoolFilter) params.append('schoolId', schoolFilter);
      if (materialFilter) params.append('materialId', materialFilter);

      const response = await fetch(`/api/issuances?${params}`);
      const data = await response.json();

      if (data.success && data.data) {
        let filteredIssuances = data.data.issuances || [];
        
        // Client-side search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredIssuances = filteredIssuances.filter((issuance: Issuance) =>
            issuance.material.title.toLowerCase().includes(query) ||
            issuance.school.name.toLowerCase().includes(query)
          );
        }
        
        setIssuances(filteredIssuances);
        if (data.data.pagination) {
          setPagination(data.data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch issuances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, schoolFilter, materialFilter, searchQuery]);

  useEffect(() => {
    fetchIssuances();
  }, [fetchIssuances]);

  const handleAddIssuance = async (data: { materialId: string; schoolId: string; quantity: number }) => {
    setIsSubmitting(true);
    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.id) {
        alert('User session not found. Please log in again.');
        return;
      }

      const response = await fetch('/api/issuances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowAddModal(false);
        fetchIssuances();
        alert('Issuance created successfully!');
      } else {
        alert(result.message || 'Failed to create issuance');
      }
    } catch (error) {
      console.error('Failed to create issuance:', error);
      alert('Failed to create issuance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteIssuance = async (data: { remarks?: string; deliveredAt?: string }) => {
    console.log('handleCompleteIssuance called with data:', data);
    console.log('selectedIssuance:', selectedIssuance);
    
    if (!selectedIssuance) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/issuances/${selectedIssuance.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      console.log('Complete issuance response:', result);

      if (result.success) {
        setShowCompleteModal(false);
        setSelectedIssuance(null);
        fetchIssuances();
        alert('Issuance completed successfully');
      } else {
        console.error('Complete failed:', result);
        alert(result.message || 'Failed to complete issuance');
      }
    } catch (error) {
      console.error('Failed to complete issuance:', error);
      alert('Failed to complete issuance: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIssuance = async () => {
    if (!selectedIssuance) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/issuances/${selectedIssuance.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setShowDeleteModal(false);
        setSelectedIssuance(null);
        fetchIssuances();
        alert('Issuance deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete issuance');
      }
    } catch (error) {
      console.error('Failed to delete issuance:', error);
      alert('Failed to delete issuance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditIssuance = async (data: { quantity: number; remarks?: string }) => {
    if (!selectedIssuance) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/issuances/${selectedIssuance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setShowEditModal(false);
        setSelectedIssuance(null);
        fetchIssuances();
        alert('Issuance updated successfully!');
      } else {
        alert(result.message || 'Failed to update issuance');
      }
    } catch (error) {
      console.error('Failed to update issuance:', error);
      alert('Failed to update issuance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleClearFilters = () => {
    setSchoolFilter('');
    setMaterialFilter('');
    setSearchQuery('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issue Items</h1>
          <p className="text-gray-600">Manage pending material issuances to schools</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchIssuances()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HiOutlineRefresh className="h-5 w-5" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HiOutlinePlus className="h-5 w-5" />
            Issue Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search */}
          <div className="flex-1 min-w-50">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search material or school..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* School Filter */}
          <div className="min-w-50">
            <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
              School
            </label>
            <select
              id="school"
              value={schoolFilter}
              onChange={(e) => {
                setSchoolFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Schools</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Material Filter */}
          <div className="min-w-50">
            <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
              Material
            </label>
            <select
              id="material"
              value={materialFilter}
              onChange={(e) => {
                setMaterialFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Materials</option>
              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.title}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(schoolFilter || materialFilter || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <IssuanceTable
            issuances={issuances}
            onComplete={(issuance) => {
              setSelectedIssuance(issuance);
              setShowCompleteModal(true);
            }}
            onView={(issuance) => {
              setSelectedIssuance(issuance);
              setShowViewModal(true);
            }}
            onEdit={(issuance) => {
              setSelectedIssuance(issuance);
              setShowEditModal(true);
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

      {/* Add Issuance Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Issue Material">
        <IssuanceForm
          onSubmit={handleAddIssuance}
          onCancel={() => setShowAddModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Complete Issuance Modal */}
      {selectedIssuance && showCompleteModal && (
        <CompleteIssuanceModal
          issuance={selectedIssuance}
          onComplete={handleCompleteIssuance}
          onCancel={() => {
            setShowCompleteModal(false);
            setSelectedIssuance(null);
          }}
          isLoading={isSubmitting}
        />
      )}

      {/* Edit Issuance Modal */}
      {showEditModal && selectedIssuance && (
        <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedIssuance(null); }} title="Edit Issuance">
          <EditIssuanceForm
            issuance={selectedIssuance}
            onSubmit={handleEditIssuance}
            onCancel={() => { setShowEditModal(false); setSelectedIssuance(null); }}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      {/* View Issuance Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Issuance Details">
        {selectedIssuance && (
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Material</p>
                  <p className="font-medium">{selectedIssuance.material.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Grade Level</p>
                  <p className="font-medium">{selectedIssuance.material.gradeLevel}</p>
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
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium">{selectedIssuance.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{selectedIssuance.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Issued</p>
                  <p className="font-medium" suppressHydrationWarning>
                    {new Date(selectedIssuance.dateIssued).toLocaleDateString()}
                  </p>
                </div>
              </div>
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
        <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedIssuance(null); }} title="Delete Issuance">
          <DeleteConfirmModal
            title="Delete Issuance"
            message="Are you sure you want to delete this issuance? The quantity will be restored to the material inventory."
            itemName={`${selectedIssuance.material.title} - ${selectedIssuance.school.schoolname}`}
            onConfirm={handleDeleteIssuance}
            onCancel={() => { setShowDeleteModal(false); setSelectedIssuance(null); }}
            isDeleting={isSubmitting}
          />
        </Modal>
      )}
    </div>
  );
}
