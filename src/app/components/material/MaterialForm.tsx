"use client";

import { useState, useEffect, useMemo } from "react";
import { HiOutlineX } from "react-icons/hi";

interface Subject {
  id: string;
  name: string;
  educationStage: string;
  category?: string;
  strand?: string;
}

interface MaterialFormData {
  name: string;
  gradeLevel: number;
  quantity: number;
  source: string;
  subjectId: string;
}

interface MaterialFormProps {
  initialData?: MaterialFormData & { id?: string };
  onSubmit: (data: MaterialFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Grade level ranges based on education stage
const GRADE_LEVELS = {
  ELEMENTARY: [1, 2, 3, 4, 5, 6],
  JUNIOR_HIGH: [7, 8, 9, 10],
  SENIOR_HIGH: [11, 12],
};

export function MaterialForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: MaterialFormProps) {
  const [formData, setFormData] = useState<MaterialFormData>({
    name: initialData?.name || "",
    gradeLevel: initialData?.gradeLevel || 1,
    quantity: initialData?.quantity || 0,
    source: initialData?.source || "",
    subjectId: initialData?.subjectId || "",
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [educationStage, setEducationStage] = useState("");
  const [category, setCategory] = useState("");
  const [strand, setStrand] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("/api/subjects");
        const data = await response.json();
        if (data.success) {
          setSubjects(data.data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  // Set initial education stage, category, and strand based on initial data
  useEffect(() => {
    if (initialData?.subjectId && subjects.length > 0) {
      const subject = subjects.find((s) => s.id === initialData.subjectId);
      if (subject) {
        setEducationStage(subject.educationStage);
        setCategory(subject.category || "");
        setStrand(subject.strand || "");
      }
    }
  }, [initialData?.subjectId, subjects]);

  // Get unique categories from subjects based on selected education stage
  const availableCategories = useMemo(() => {
    const stageFiltered = educationStage
      ? subjects.filter((s) => s.educationStage === educationStage)
      : subjects;
    const categories = [...new Set(stageFiltered.map((s) => s.category).filter(Boolean))];
    return categories.sort();
  }, [subjects, educationStage]);

  // Get unique strands from subjects (only for Senior High)
  const availableStrands = useMemo(() => {
    if (educationStage !== "SENIOR_HIGH") return [];
    const stageFiltered = subjects.filter((s) => s.educationStage === "SENIOR_HIGH");
    const categoryFiltered = category
      ? stageFiltered.filter((s) => s.category === category)
      : stageFiltered;
    const strands = [...new Set(categoryFiltered.map((s) => s.strand).filter(Boolean))];
    return strands.sort();
  }, [subjects, educationStage, category]);

  // Get available grade levels based on education stage
  const availableGradeLevels = useMemo(() => {
    if (!educationStage) {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
    return GRADE_LEVELS[educationStage as keyof typeof GRADE_LEVELS] || [];
  }, [educationStage]);

  // Filter subjects based on education stage, category, and strand
  const filteredSubjects = useMemo(() => {
    let filtered = subjects;
    
    if (educationStage) {
      filtered = filtered.filter((s) => s.educationStage === educationStage);
    }
    if (category) {
      filtered = filtered.filter((s) => s.category === category);
    }
    if (strand && educationStage === "SENIOR_HIGH") {
      filtered = filtered.filter((s) => s.strand === strand);
    }
    
    return filtered;
  }, [subjects, educationStage, category, strand]);

  // Reset dependent fields when education stage changes
  useEffect(() => {
    if (educationStage && availableGradeLevels.length > 0) {
      // Check if current grade level is valid for the selected stage
      if (!availableGradeLevels.includes(formData.gradeLevel)) {
        setFormData((prev) => ({ ...prev, gradeLevel: availableGradeLevels[0] }));
      }
    }
  }, [educationStage, availableGradeLevels, formData.gradeLevel]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Material name is required";
    }
    if (formData.gradeLevel < 1 || formData.gradeLevel > 12) {
      newErrors.gradeLevel = "Grade level must be between 1 and 12";
    }
    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }
    if (!formData.subjectId) {
      newErrors.subjectId = "Subject is required";
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
      {/* Material Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Material Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., English Learner's Material Grade 3"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Education Stage (for filtering subjects and grade levels) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Education Stage
        </label>
        <select
          value={educationStage}
          onChange={(e) => {
            setEducationStage(e.target.value);
            setCategory("");
            setStrand("");
            setFormData((prev) => ({ ...prev, subjectId: "" }));
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Stage (optional)</option>
          <option value="ELEMENTARY">Elementary</option>
          <option value="JUNIOR_HIGH">Junior High</option>
          <option value="SENIOR_HIGH">Senior High</option>
        </select>
      </div>

      {/* Category and Strand Filters */}
      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setStrand("");
              setFormData((prev) => ({ ...prev, subjectId: "" }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Strand (only enabled for Senior High) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Strand {educationStage !== "SENIOR_HIGH" && <span className="text-gray-400 text-xs">(Senior High only)</span>}
          </label>
          <select
            value={strand}
            onChange={(e) => {
              setStrand(e.target.value);
              setFormData((prev) => ({ ...prev, subjectId: "" }));
            }}
            disabled={educationStage !== "SENIOR_HIGH"}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              educationStage !== "SENIOR_HIGH" ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
            }`}
          >
            <option value="">All Strands</option>
            {availableStrands.map((str) => (
              <option key={str} value={str}>
                {str}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject <span className="text-red-500">*</span>
        </label>
        <select
          name="subjectId"
          value={formData.subjectId}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.subjectId ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select a subject</option>
          {filteredSubjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
              {subject.strand && ` (${subject.strand})`}
              {!educationStage && ` - ${subject.educationStage.replace("_", " ")}`}
            </option>
          ))}
        </select>
        {errors.subjectId && (
          <p className="mt-1 text-sm text-red-500">{errors.subjectId}</p>
        )}
        {filteredSubjects.length === 0 && (educationStage || category || strand) && (
          <p className="mt-1 text-sm text-amber-600">No subjects found for the selected filters.</p>
        )}
      </div>

      {/* Grade Level and Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grade Level <span className="text-red-500">*</span>
          </label>
          <select
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.gradeLevel ? "border-red-500" : "border-gray-300"
            }`}
          >
            {availableGradeLevels.map((grade) => (
              <option key={grade} value={grade}>
                Grade {grade}
              </option>
            ))}
          </select>
          {educationStage && (
            <p className="mt-1 text-xs text-gray-500">
              {educationStage === "ELEMENTARY" && "Grades 1-6"}
              {educationStage === "JUNIOR_HIGH" && "Grades 7-10"}
              {educationStage === "SENIOR_HIGH" && "Grades 11-12"}
            </p>
          )}
          {errors.gradeLevel && (
            <p className="mt-1 text-sm text-red-500">{errors.gradeLevel}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.quantity ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
          )}
        </div>
      </div>

      {/* Source */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source
        </label>
        <input
          type="text"
          name="source"
          value={formData.source}
          onChange={handleChange}
          placeholder="e.g., DepEd Central, Division Office, Donated"
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
          {initialData?.id ? "Update Material" : "Add Material"}
        </button>
      </div>
    </form>
  );
}
