"use client";

import { useState, useCallback, useEffect } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import { Modal } from "@/app/components/ui/Modal";
import { MaterialTable } from "@/app/components/material/MaterialTable";
import { MaterialForm } from "@/app/components/material/MaterialForm";
import { MaterialFilters } from "@/app/components/material/MaterialFilters";
import { DeleteConfirmModal } from "@/app/components/ui/DeleteConfirmModal";

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    gradeLevel: "",
    subjectId: "",
    educationStage: "",
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch materials
  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.gradeLevel && { gradeLevel: filters.gradeLevel }),
        ...(filters.subjectId && { subjectId: filters.subjectId }),
        ...(filters.educationStage && { educationStage: filters.educationStage }),
      });

      const response = await fetch(`/api/materials?${params}`);
      const data = await response.json();

      if (data.success) {
        setMaterials(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Handle filter change
  const handleFilterChange = useCallback(
    (newFilters: typeof filters) => {
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    },
    []
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Handle add material
  const handleAddMaterial = async (data: {
    name: string;
    gradeLevel: number;
    quantity: number;
    source: string;
    subjectId: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        setIsAddModalOpen(false);
        fetchMaterials();
        alert('Material added successfully!');
      } else {
        alert(result.message || "Failed to add material");
      }
    } catch (error) {
      console.error("Error adding material:", error);
      alert("An error occurred while adding the material");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit material
  const handleEditMaterial = async (data: {
    name: string;
    gradeLevel: number;
    quantity: number;
    source: string;
    subjectId: string;
  }) => {
    if (!selectedMaterial) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/materials/${selectedMaterial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        setIsEditModalOpen(false);
        setSelectedMaterial(null);
        fetchMaterials();
        alert('Material updated successfully!');
      } else {
        alert(result.message || "Failed to update material");
      }
    } catch (error) {
      console.error("Error updating material:", error);
      alert("An error occurred while updating the material");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete material
  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/materials/${selectedMaterial.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        setIsDeleteModalOpen(false);
        setSelectedMaterial(null);
        fetchMaterials();
        alert('Material deleted successfully!');
      } else {
        alert(result.message || "Failed to delete material");
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("An error occurred while deleting the material");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (material: Material) => {
    setSelectedMaterial(material);
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">
            Manage learning resources and materials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Material
          </button>
        </div>
      </div>

      {/* Filters */}
      <MaterialFilters onFilterChange={handleFilterChange} />

      {/* Table */}
      <MaterialTable
        materials={materials}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        isLoading={isLoading}
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Material"
        size="lg"
      >
        <MaterialForm
          onSubmit={handleAddMaterial}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMaterial(null);
        }}
        title="Edit Material"
        size="lg"
      >
        {selectedMaterial && (
          <MaterialForm
            initialData={{
              id: selectedMaterial.id,
              name: selectedMaterial.name,
              gradeLevel: selectedMaterial.gradeLevel,
              quantity: selectedMaterial.quantity,
              source: selectedMaterial.source || "",
              subjectId: selectedMaterial.subjectId,
            }}
            onSubmit={handleEditMaterial}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedMaterial(null);
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMaterial(null);
        }}
        title="Delete Material"
        size="sm"
      >
        {selectedMaterial && (
          <DeleteConfirmModal
            title="Delete Material"
            message="Are you sure you want to delete this material? This action cannot be undone."
            itemName={selectedMaterial.name}
            onConfirm={handleDeleteMaterial}
            onCancel={() => {
              setIsDeleteModalOpen(false);
              setSelectedMaterial(null);
            }}
            isDeleting={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
}
