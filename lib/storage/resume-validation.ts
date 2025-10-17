/**
 * Client-side validation utilities for resume uploads
 * This file does NOT use 'use server' so it can be used in both client and server contexts
 */

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file for resume upload
 * This is a pure function with no async operations
 */
export function validateResumeFile(file: File): ValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a PDF, DOC, or DOCX file',
    };
  }

  return { valid: true };
}

/**
 * Get human-readable file type names
 */
export function getAcceptedFileTypes(): string {
  return 'PDF, DOC, DOCX';
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop() || '';
}
