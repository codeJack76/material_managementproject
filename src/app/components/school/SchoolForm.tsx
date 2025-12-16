"use client";

import { useState } from "react";

interface SchoolFormData {
  schoolname: string;
  schooltype: "ELEMENTARY" | "SECONDARY" | "INTEGRATED";
  municipality: string;
  congressionalDistrict: number;
  zone: string;
}

interface SchoolFormProps {
  initialData?: SchoolFormData & { id?: string };
  onSubmit: (data: SchoolFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Davao de Oro municipalities
const MUNICIPALITIES = [
  "Compostela",
  "Laak",
  "Mabini",
  "Maco",
  "Maragusan",
  "Mawab",
  "Monkayo",
  "Montevista",
  "Nabunturan",
  "New Bataan",
  "Pantukan",
];

export function SchoolForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: SchoolFormProps) {
  const [formData, setFormData] = useState<SchoolFormData>({
    schoolname: initialData?.schoolname || "",
    schooltype: initialData?.schooltype || "ELEMENTARY",
    municipality: initialData?.municipality || "",
    congressionalDistrict: initialData?.congressionalDistrict || 1,
    zone: initialData?.zone || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.schoolname.trim()) {
      newErrors.schoolname = "School name is required";
    }
    if (!formData.municipality) {
      newErrors.municipality = "Municipality is required";
    }
    if (!formData.congressionalDistrict) {
      newErrors.congressionalDistrict = "Congressional district is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* School Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          School Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="schoolname"
          value={formData.schoolname}
          onChange={handleChange}
          placeholder="e.g., Compostela Central Elementary School"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.schoolname ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.schoolname && (
          <p className="mt-1 text-sm text-red-500">{errors.schoolname}</p>
        )}
      </div>

      {/* School Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          School Type <span className="text-red-500">*</span>
        </label>
        <select
          name="schooltype"
          value={formData.schooltype}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ELEMENTARY">Elementary</option>
          <option value="SECONDARY">Secondary</option>
          <option value="INTEGRATED">Integrated</option>
        </select>
      </div>

      {/* Municipality and District */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Municipality <span className="text-red-500">*</span>
          </label>
          <select
            name="municipality"
            value={formData.municipality}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.municipality ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select Municipality</option>
            {MUNICIPALITIES.map((mun) => (
              <option key={mun} value={mun}>
                {mun}
              </option>
            ))}
          </select>
          {errors.municipality && (
            <p className="mt-1 text-sm text-red-500">{errors.municipality}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Congressional District <span className="text-red-500">*</span>
          </label>
          <select
            name="congressionalDistrict"
            value={formData.congressionalDistrict}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.congressionalDistrict ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value={1}>District 1</option>
            <option value={2}>District 2</option>
          </select>
          {errors.congressionalDistrict && (
            <p className="mt-1 text-sm text-red-500">
              {errors.congressionalDistrict}
            </p>
          )}
        </div>
      </div>

      {/* Zone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zone
        </label>
        <input
          type="text"
          name="zone"
          value={formData.zone}
          onChange={handleChange}
          placeholder="e.g., Urban, Rural, Coastal"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {initialData?.id ? "Update School" : "Add School"}
        </button>
      </div>
    </form>
  );
}
