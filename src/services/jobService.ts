import api from './api';

export type JobCategory = 'technology' | 'finance' | 'healthcare' | 'education' | 'marketing' | 'sales' | 'design' | 'customer-service' | 'human-resources' | 'other';

export interface CompanyInfo {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
}

export interface JobPostingData {
  id?: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
  status?: 'draft' | 'published' | 'closed';
  description: string;
  salary?: string;
  experience?: string;
  requirements: string[];
  applications?: number;
  posted?: string;
  pdfUrl?: string;
  category: JobCategory;
  company?: CompanyInfo;
  postedBy?: {
    id: string;
    name: string;
    email: string;
  };
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobPostingResponse {
  success: boolean;
  data: JobPostingData | JobPostingData[] | null;
  message?: string;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
}

export interface GetJobsParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  location?: string;
  type?: string;
  status?: string;
  category?: string;
  companyId?: string;
  excludeExpired?: boolean;
  sortBy?: 'newest' | 'oldest' | 'title' | 'department';
}

const jobService = {
  /**
   * Get all job postings with optional filters and pagination
   */
  getJobs: async (params: GetJobsParams = {}): Promise<JobPostingResponse> => {
    try {
      // Transform sortBy parameter to match API expectations
      const { sortBy, ...restParams } = params;
      const queryParams: any = { ...restParams };
      
      if (sortBy) {
        switch (sortBy) {
          case 'newest':
            queryParams.sortBy = '-createdAt';
            break;
          case 'oldest':
            queryParams.sortBy = 'createdAt';
            break;
          case 'title':
            queryParams.sortBy = 'title';
            break;
          case 'department':
            queryParams.sortBy = 'department';
            break;
        }
      }
      
      const response = await api.get('/jobs', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },
  
  /**
   * Get a single job posting by ID
   */
  getJobById: async (id: string): Promise<JobPostingResponse> => {
    try {
      const response = await api.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new job posting
   */
  createJob: async (jobData: Omit<JobPostingData, 'id' | 'status' | 'applications' | 'posted'>): Promise<JobPostingResponse> => {
    try {
      const response = await api.post('/jobs', jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job posting:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing job posting
   */
  updateJob: async (id: string, jobData: Partial<JobPostingData>): Promise<JobPostingResponse> => {
    try {
      const response = await api.put(`/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.error(`Error updating job ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a job posting
   */
  deleteJob: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.delete(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting job ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get jobs by company ID
   */
  getJobsByCompany: async (companyId: string, params: Omit<GetJobsParams, 'companyId'> = {}): Promise<JobPostingResponse> => {
    try {
      const response = await api.get(`/jobs/company/${companyId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      throw error;
    }
  },
  
  /**
   * Get similar jobs based on category and department
   */
  getSimilarJobs: async (jobId: string, limit: number = 4): Promise<JobPostingResponse> => {
    try {
      const response = await api.get(`/jobs/${jobId}/similar`, { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching similar jobs:', error);
      throw error;
    }
  },
  
  /**
   * Get job categories with count
   */
  getCategories: async (): Promise<{ category: JobCategory; count: number }[]> => {
    try {
      const response = await api.get('/jobs/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching job categories:', error);
      return [];
    }
  },
  
  /**
   * Get job posting statistics
   */
  getJobStats: async (): Promise<{
    success: boolean;
    data: {
      total: number;
      active: number;
      draft: number;
      closed: number;
      statuses: Array<{ status: string; count: number }>;
      categories: Array<{ category: JobCategory; count: number }>;
      applicationsStats: Array<{ _id: number; applications: number }>;
      topDepartments: Array<{ _id: string; count: number }>;
      recentJobs: JobPostingData[];
    };
  }> => {
    try {
      const response = await api.get('/jobs/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching job stats:', error);
      throw error;
    }
  },
  
  /**
   * Get job application statistics for a job posting
   */
  getJobApplicationStats: async (jobId: string): Promise<{
    success: boolean;
    data: {
      total: number;
      statuses: Array<{ status: string; count: number }>;
      sources: Array<{ source: string; count: number }>;
      timeline: Array<{ date: string; count: number }>;
    };
  }> => {
    try {
      const response = await api.get(`/jobs/${jobId}/applications/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job application stats:', error);
      throw error;
    }
  },
  
  /**
   * Update job status (publish, close, etc.)
   */
  updateJobStatus: async (id: string, status: 'draft' | 'published' | 'closed'): Promise<JobPostingResponse> => {
    try {
      const response = await api.patch(`/jobs/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  },
  
  /**
   * Extend job posting expiration date
   */
  extendJobPosting: async (id: string, days: number = 30): Promise<JobPostingResponse> => {
    try {
      const response = await api.patch(`/jobs/${id}/extend`, { days });
      return response.data;
    } catch (error) {
      console.error('Error extending job posting:', error);
      throw error;
    }
  },
  
  /**
   * Duplicate an existing job posting
   */
  duplicateJob: async (id: string): Promise<JobPostingResponse> => {
    try {
      const response = await api.post(`/jobs/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating job:', error);
      throw error;
    }
  },
  
  /**
   * Get job application form fields
   */
  getApplicationFormFields: async (jobId: string): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      label: string;
      type: string;
      required: boolean;
      options?: string[];
    }>;
  }> => {
    try {
      const response = await api.get(`/jobs/${jobId}/application-form`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application form fields:', error);
      throw error;
    }
  },
  
  /**
   * Submit job application
   */
  submitApplication: async (jobId: string, formData: FormData): Promise<{
    success: boolean;
    message: string;
    applicationId?: string;
  }> => {
    try {
      const response = await api.post(`/jobs/${jobId}/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error submitting application:', error);
      throw error.response?.data || { success: false, message: 'Failed to submit application' };
    }
  },
};

export default jobService;
