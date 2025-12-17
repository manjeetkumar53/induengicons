import React from 'react';

/**
 * Generic row data interface for data grids
 */
export interface DataGridRow {
  _id?: string;
  id?: string;
  [key: string]: unknown;
}

/**
 * Transaction data interface for grids
 */
export interface TransactionRow extends DataGridRow {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: Date | string;
  projectId?: string;
  projectName?: string;
  categoryId?: string;
  categoryName?: string;
  expenseCategoryId?: string;
  expenseCategoryName?: string;
  source?: string;
  paymentMethod: string;
  receiptNumber?: string;
  status: string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/**
 * Project data interface for grids
 */
export interface ProjectRow extends DataGridRow {
  _id: string;
  name: string;
  code: string;
  description?: string;
  type: string;
  status: string;
  client?: {
    id: string;
    name: string;
    contactPerson: string;
  };
  budget?: {
    totalBudget: number;
    allocatedBudget: number;
    spentAmount: number;
    remainingBudget: number;
    currency: string;
  };
  timeline?: {
    startDate: Date | string;
    estimatedEndDate?: Date | string;
    actualEndDate?: Date | string;
  };
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/**
 * Allocation data interface for grids
 */
export interface AllocationRow extends DataGridRow {
  _id: string;
  allocationNumber: string;
  sourceProjectId?: string;
  sourceProjectName?: string;
  targetProjectId: string;
  targetProjectName: string;
  amount: number;
  description: string;
  date: Date | string;
  allocationType: string;
  status: string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/**
 * Category data interface for grids  
 */
export interface CategoryRow extends DataGridRow {
  _id: string;
  name: string;
  description?: string;
  type: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/**
 * Contact form data interface
 */
export interface ContactRow extends DataGridRow {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType?: string;
  message: string;
  status: 'new' | 'in_progress' | 'responded' | 'closed';
  createdAt: Date | string;
  timestamp?: Date | string;
}

/**
 * Chart data interface for reports
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
  [key: string]: unknown;
}

/**
 * Report filter values interface
 */
export interface FilterValues {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense' | 'all';
  projectId?: string;
  projectName?: string;
  categoryId?: string;
  paymentMethod?: string;
  status?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  [key: string]: unknown;
}

/**
 * API Response generic interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: unknown;
  };
}

/**
 * Form field validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Component state for async operations
 */
export interface AsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Select option interface for dropdowns
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Pagination state interface
 */
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Sort configuration interface
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Table action button interface
 */
export interface TableAction<T = DataGridRow> {
  label: string;
  icon: React.ReactNode;
  action: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: (row: T) => boolean;
}