'use server';

import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import { validateResumeFile } from './resume-validation';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Upload a resume file to Supabase Storage
 * @param file - The file to upload
 * @param candidateEmail - Email of the candidate (for organizing files)
 * @returns Upload result with URL or error
 */
export async function uploadResume(
  file: File,
  candidateEmail: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateResumeFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const supabase = await createClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const uniqueId = nanoid(10);
    const fileName = `${candidateEmail.replace('@', '_')}_${timestamp}_${uniqueId}.${fileExt}`;
    const filePath = `resumes/${fileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return {
        success: false,
        error: 'Failed to upload resume. Please try again.',
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Resume upload error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during upload',
    };
  }
}

/**
 * Delete a resume file from Supabase Storage
 * @param path - The storage path of the file to delete
 */
export async function deleteResume(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage.from('resumes').remove([path]);

    if (error) {
      console.error('Error deleting resume:', error);
      return {
        success: false,
        error: 'Failed to delete resume',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Resume deletion error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during deletion',
    };
  }
}

/**
 * Download a resume file from Supabase Storage
 * @param path - The storage path of the file
 */
export async function downloadResume(path: string): Promise<Blob | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage.from('resumes').download(path);

    if (error) {
      console.error('Error downloading resume:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Resume download error:', error);
    return null;
  }
}

/**
 * Get the public URL for a resume
 * @param path - The storage path of the file
 */
export async function getResumeUrl(path: string): Promise<string | null> {
  try {
    const supabase = await createClient();

    const { data } = supabase.storage.from('resumes').getPublicUrl(path);

    return data.publicUrl;
  } catch (error) {
    console.error('Error getting resume URL:', error);
    return null;
  }
}
