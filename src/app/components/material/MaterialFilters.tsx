"use client";

import { useState, useEffect } from "react";
import { HiOutlineSearch, HiOutlineFilter, HiOutlineX } from "react-icons/hi";

interface Subject {
  id: string;
  name: string;
  educationStage: string;
}

interface MaterialFiltersProps {
  onFilterChange: (filters: {
    search: string;
    gradeLevel: string;
    subjectId: string;
    educationStage: string;
  }) => void;
}

export function MaterialFilters({ onFilterChange }: MaterialFiltersProps) {
  const [search, setSearch] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [educationStage, setEducationStage] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch subjects for filter dropdown
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, gradeLevel, subjectId, educationStage });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, gradeLevel, subjectId, educationStage, onFilterChange]);

  const clearFilters = () => {
    setSearch("");
    setGradeLevel("");
    setSubjectId("");
    setEducationStage("");
  };

  const hasActiveFilters = gradeLevel || subjectId || educationStage;

  // Filter subjects by education stage
  const filteredSubjects = educationStage
    ? subjects.filter((s) => s.educationStage === educationStage)
    : subjects;

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search materials..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors
            ${
              showFilters || hasActiveFilters
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }
          `}
        >
          <HiOutlineFilter className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
              {[gradeLevel, subjectId, educationStage].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Education Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Stage
              </label>
              <select
                value={educationStage}
                onChange={(e) => {
                  setEducationStage(e.target.value);
                  setSubjectId(""); // Reset subject when stage changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Stages</option>
                <option value="ELEMENTARY">Elementary</option>
                <option value="JUNIOR_HIGH">Junior High</option>
                <option value="SENIOR_HIGH">Senior High</option>
              </select>
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Grades</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Subjects</option>
                {filteredSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.educationStage.replace("_", " ")})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <HiOutlineX className="w-4 h-4" />
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
