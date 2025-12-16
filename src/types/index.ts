// Re-export Prisma generated types for convenience
export type {
  User,
  Subject,
  Material,
  School,
  Issuance,
  CompletedIssuance,
} from "@prisma/client";

export { Role, EducationStage, SchoolType } from "@prisma/client";

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================
// Form/Input Types (for create/update operations)
// ============================================

export interface CreateUserInput {
  username: string;
  password: string;
  role?: "ADMIN" | "USER";
}

export interface UpdateUserInput {
  username?: string;
  password?: string;
  role?: "ADMIN" | "USER";
}

export interface CreateSubjectInput {
  name: string;
  category?: string;
  strand?: string;
  educationStage: "ELEMENTARY" | "JUNIOR_HIGH" | "SENIOR_HIGH";
}

export interface UpdateSubjectInput {
  name?: string;
  category?: string;
  strand?: string;
  educationStage?: "ELEMENTARY" | "JUNIOR_HIGH" | "SENIOR_HIGH";
}

export interface CreateMaterialInput {
  name: string;
  gradeLevel: number;
  quantity?: number;
  source?: string;
  subjectId: string;
}

export interface UpdateMaterialInput {
  name?: string;
  gradeLevel?: number;
  quantity?: number;
  source?: string;
  subjectId?: string;
}

export interface CreateSchoolInput {
  name: string;
  type: "ELEMENTARY" | "SECONDARY" | "INTEGRATED";
  municipality: string;
  congressionalDistrict: number;
  zone?: string;
}

export interface UpdateSchoolInput {
  name?: string;
  type?: "ELEMENTARY" | "SECONDARY" | "INTEGRATED";
  municipality?: string;
  congressionalDistrict?: number;
  zone?: string;
}

export interface CreateIssuanceInput {
  materialId: string;
  schoolId: string;
  userId: string;
  quantity: number;
  remarks?: string;
}

export interface UpdateIssuanceInput {
  quantity?: number;
  remarks?: string;
}

export interface CompleteIssuanceInput {
  issuanceId: string;
  receivedBy?: string;
  remarks?: string;
}

// ============================================
// Extended Types (with relations)
// ============================================

import type {
  User as PrismaUser,
  Subject as PrismaSubject,
  Material as PrismaMaterial,
  School as PrismaSchool,
  Issuance as PrismaIssuance,
  CompletedIssuance as PrismaCompletedIssuance,
} from "@/generated/prisma";

export interface MaterialWithSubject extends PrismaMaterial {
  subject: PrismaSubject;
}

export interface IssuanceWithRelations extends PrismaIssuance {
  material: PrismaMaterial;
  school: PrismaSchool;
  user: PrismaUser;
  completedIssuance?: PrismaCompletedIssuance | null;
}

export interface CompletedIssuanceWithRelations extends PrismaCompletedIssuance {
  issuance: IssuanceWithRelations;
}

export interface SubjectWithMaterials extends PrismaSubject {
  materials: PrismaMaterial[];
}

export interface SchoolWithIssuances extends PrismaSchool {
  issuances: PrismaIssuance[];
}

// ============================================
// Dashboard/Stats Types
// ============================================

export interface DashboardStats {
  totalMaterials: number;
  totalSchools: number;
  totalIssuances: number;
  completedIssuances: number;
  pendingIssuances: number;
  totalUsers: number;
}

export interface RecentActivity {
  id: string;
  type: "issuance" | "completed" | "material" | "school";
  description: string;
  timestamp: Date;
}

// ============================================
// Filter/Search Types
// ============================================

export interface MaterialFilters {
  search?: string;
  gradeLevel?: number;
  subjectId?: string;
  educationStage?: "ELEMENTARY" | "JUNIOR_HIGH" | "SENIOR_HIGH";
}

export interface SchoolFilters {
  search?: string;
  type?: "ELEMENTARY" | "SECONDARY" | "INTEGRATED";
  municipality?: string;
  congressionalDistrict?: number;
}

export interface IssuanceFilters {
  search?: string;
  schoolId?: string;
  materialId?: string;
  status?: "pending" | "completed";
  dateFrom?: Date;
  dateTo?: Date;
}
