import { config } from '../config/env';
import {
  encryptRequestPayload,
  tryDecryptResponse,
  isEncryptionEnabled,
} from './encryption';

// API Configuration
const API_BASE_URL = config.API_BASE_URL;

// API Response Interface
interface ApiResponse<T = any> {
  status: 'success' | 'error';
  status_code: number;
  message: string;
  data: T | null;
}

// Auth Response Interface
interface AuthResponse {
  token: string;
  user: {
    id: number;
    army_no: string;
    role: string;
    profile_id: number | null;
    profile: {
      id: number;
      name: string;
      rank: string;
      unit?: string;
      photo_url?: string;
    } | null;
  };
}

// Login Request Interface
interface LoginRequest {
  army_no: string;
  password: string;
}

// Base API Service Class
class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Don't set Content-Type for FormData requests (let axios handle it)
    if (options.body instanceof FormData) {
      delete defaultHeaders['Content-Type'];
    }

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const requestConfig: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    // Encrypt JSON payloads when enabled
    if (
      isEncryptionEnabled() &&
      requestConfig.body &&
      typeof requestConfig.body === 'string' &&
      requestConfig.headers &&
      requestConfig.headers['Content-Type'] === 'application/json'
    ) {
      try {
        const parsedBody = JSON.parse(requestConfig.body);
        const encryptedBody = encryptRequestPayload(parsedBody);
        requestConfig.body = JSON.stringify(encryptedBody);
      } catch (error) {
        console.error('Failed to encrypt request payload:', error);
        throw error;
      }
    }

    try {
      const response = await fetch(url, requestConfig);
      
      
      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Dispatch custom event for AuthContext to handle
        window.dispatchEvent(new CustomEvent('auth-error', { 
          detail: { message: 'Authentication failed. Please login again.' } 
        }));
        throw new Error('Authentication failed. Please login again.');
      }

      // Safely parse response - avoid "Unexpected end of JSON input" when server
      // returns 500 with empty body (e.g. proxy timeout, crash, or bad gateway)
      const text = await response.text();
      let raw: unknown = {};
      try {
        raw = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        const errMsg = !response.ok
          ? `Request failed with status ${response.status}. ${text ? `Server response: ${text.slice(0, 300)}` : 'Server returned empty or invalid response.'}`
          : 'Invalid JSON response from server';
        throw new Error(errMsg);
      }

      const data = tryDecryptResponse<ApiResponse<T>>(raw, response.headers);

      // For 2xx success status codes, return the data regardless of status field (success/failure)
      // This allows the frontend to handle success/failure based on the status field
      if (response.ok && response.status >= 200 && response.status < 300) {
        return data;
      }

      // For non-ok HTTP status codes (not 200), throw an error
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
  
      throw error;
    }
  }

  // GET request - optional signal for abort/cancel (e.g. to prevent duplicate calls from React Strict Mode)
  async get<T>(endpoint: string, options?: { signal?: AbortSignal }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', signal: options?.signal });
  }

  // POST request
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  // PUT request
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Auth Service (ViewModel)
class AuthService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Login method
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/login', credentials);
      
      if (response.status === 'success' && response.data) {
        // Create user object with profile data merged for easier access
        const userData = {
          ...response.data.user,
          name: response.data.user.profile?.name || response.data.user.army_no,
          rank: response.data.user.profile?.rank || 'User',
          unit: response.data.user.profile?.unit || '',
          photo_url: response.data.user.profile?.photo_url || ''
        };
        
        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return {
          token: response.data.token,
          user: userData as any
        };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
  
      throw error;
    }
  }

  // Logout method
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Get current user
  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Validate token
  async validateToken(): Promise<boolean> {
    try {
      const response = await this.api.get('/auth/profile');
      return response.status === 'success';
    } catch (error) {
      return false;
    }
  }
}

// Personnel Service (ViewModel)
class PersonnelService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Get all personnel with pagination, search, and advanced filters
  async getAllPersonnel(page: number = 1, limit: number = 25, search: string = '', filters?: any) {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (search && search.trim()) params.set('search', search.trim());
    if (filters && Object.keys(filters).length > 0) params.set('filters', JSON.stringify(filters));
    return this.api.get(`/personnel?${params.toString()}`);
  }

  // Get personnel by ID
  async getPersonnelById(id: number) {
    return this.api.get(`/personnel/${id}`);
  }

  // Create new personnel
  async createPersonnel(data: any) {
    return this.api.post('/personnel', data);
  }

  // Bulk upload personnel from Excel
  async bulkUploadPersonnel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post('/personnel/bulk-upload', formData);
  }

  // Download personnel bulk upload template
  async downloadPersonnelTemplate() {
    const url = `${API_BASE_URL}/personnel/bulk-upload/template`;
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to download template' }));
      throw new Error(error.message || 'Failed to download template');
    }

    return {
      data: await response.blob(),
      status: response.status
    };
  }

  // Update personnel
  async updatePersonnel(id: number, data: any) {
    return this.api.put(`/personnel/${id}`, data);
  }

  // Delete personnel
  async deletePersonnel(id: number) {
    return this.api.delete(`/personnel/${id}`);
  }

  // Reset personnel password to DOB (DDMMYYYY). Admin only.
  async resetPassword(id: number) {
    return this.api.post(`/personnel/${id}/reset-password`, {});
  }

  // Upload personnel photo
  async uploadPersonnelPhoto(id: number, photoFile: File) {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    return this.api.post(`/personnel/${id}/photo`, formData);
  }

  // Delete personnel photo
  async deletePersonnelPhoto(id: number) {
    return this.api.delete(`/personnel/${id}/photo`);
  }

  // Get personnel courses
  async getPersonnelCourses(personnelId: number) {
    return this.api.get(`/personnel/${personnelId}/courses`);
  }

  async getPersonnelOutStation(personnelId: number) {
    return this.api.get(`/personnel/${personnelId}/out-station-employment`);
  }

  // Create personnel course
  async createPersonnelCourse(personnelId: number, data: any) {
    return this.api.post(`/personnel/${personnelId}/courses`, data);
  }

  // Update personnel course (updates user_course_mapping table)
  async updateCourse(courseMappingId: number, data: any) {
    return this.api.put(`/personnel-courses/${courseMappingId}`, data);
  }

  // Delete personnel course (deletes from user_course_mapping table)
  async deleteCourse(courseMappingId: number) {
    return this.api.delete(`/personnel-courses/${courseMappingId}`);
  }

  // Get personnel field services
  async getPersonnelFieldServices(personnelId: number) {
    return this.api.get(`/personnel/${personnelId}/field-services`);
  }

  // Create field service
  async createFieldService(personnelId: number, data: any) {
    return this.api.post(`/personnel/${personnelId}/field-services`, data);
  }

  // Update field service
  async updateFieldService(fieldServiceId: number, data: any) {
    return this.api.put(`/field-services/${fieldServiceId}`, data);
  }

  // Delete field service
  async deleteFieldService(fieldServiceId: number) {
    return this.api.delete(`/field-services/${fieldServiceId}`);
  }

  // Get personnel foreign postings
  async getPersonnelForeignPostings(personnelId: number) {
    return this.api.get(`/personnel/${personnelId}/foreign-postings`);
  }

  // Create foreign posting
  async createForeignPosting(personnelId: number, data: any) {
    return this.api.post(`/personnel/${personnelId}/foreign-postings`, data);
  }

  // Update foreign posting
  async updateForeignPosting(foreignPostingId: number, data: any) {
    return this.api.put(`/foreign-postings/${foreignPostingId}`, data);
  }

  // Delete foreign posting
  async deleteForeignPosting(foreignPostingId: number) {
    return this.api.delete(`/foreign-postings/${foreignPostingId}`);
  }

  // Get personnel punishment offences
  async getPersonnelPunishmentOffences(personnelId: number) {
    console.log('Calling punishment offence endpoint:', `/punishmentOffence/${personnelId}`);
    return this.api.get(`/punishmentOffence/${personnelId}`);
  }

  // Create punishment offence
  async createPunishmentOffence(personnelId: number, data: any) {
    return this.api.post(`/punishmentOffence/${personnelId}`, data);
  }

  // Update punishment offence
  async updatePunishmentOffence(punishmentOffenceId: number, data: any) {
    return this.api.put(`/punishmentOffence/${punishmentOffenceId}`, data);
  }

  // Delete punishment offence
  async deletePunishmentOffence(punishmentOffenceId: number) {
    return this.api.delete(`/punishmentOffence/${punishmentOffenceId}`);
  }

  // Get personnel EREs
  async getPersonnelEREs(personnelId: number) {
    return this.api.get(`/personnel/${personnelId}/eres`);
  }

  // Create ERE
  async createERE(personnelId: number, data: any) {
    return this.api.post(`/personnel/${personnelId}/eres`, data);
  }

  // Update ERE
  async updateERE(ereId: number, data: any) {
    return this.api.put(`/eres/${ereId}`, data);
  }

  // Delete ERE
  async deleteERE(ereId: number) {
    return this.api.delete(`/eres/${ereId}`);
  }

  // Get personnel proficiencies
  async getPersonnelProficiencies(personnelId: number) {
    return this.api.get(`/personnel/${personnelId}/proficiencies`);
  }

  // Create proficiency
  async createProficiency(personnelId: number, data: any) {
    return this.api.post(`/personnel/${personnelId}/proficiencies`, data);
  }

  // Update proficiency
  async updateProficiency(proficiencyId: number, data: any) {
    return this.api.put(`/proficiencies/${proficiencyId}`, data);
  }

  // Delete proficiency
  async deleteProficiency(proficiencyId: number) {
    return this.api.delete(`/proficiencies/${proficiencyId}`);
  }

  // Get all drone equipment
  async getDroneEquipment() {
    return this.api.get(`/drone-equipment`);
  }

  // Get all proficiencies (for drone pilots page)
  async getAllProficiencies(proficiencyType?: string) {
    const query = proficiencyType ? `?proficiency_type=${proficiencyType}` : '';
    return this.api.get(`/drone-pilots${query}`);
  }

  // Get personnel family problems
  async getPersonnelFamilyProblems(personnelId: number) {
    return this.api.get(`/personnel/${personnelId}/family-problems`);
  }

  // Create family problem
  async createFamilyProblem(personnelId: number, data: any) {
    return this.api.post(`/personnel/${personnelId}/family-problems`, data);
  }

  // Update family problem
  async updateFamilyProblem(familyProblemId: number, data: any) {
    return this.api.put(`/family-problems/${familyProblemId}`, data);
  }

  // Delete family problem
  async deleteFamilyProblem(familyProblemId: number) {
    return this.api.delete(`/family-problems/${familyProblemId}`);
  }

  // Get personnel family details
  async getPersonnelFamilyDetails(personnelId: number) {
    return this.api.get(`/personnel/${personnelId}/family-details`);
  }

  // Create family detail
  async createFamilyDetail(personnelId: number, data: any) {
    return this.api.post(`/personnel/${personnelId}/family-details`, data);
  }

  // Update family detail
  async updateFamilyDetail(familyDetailId: number, data: any) {
    return this.api.put(`/family-details/${familyDetailId}`, data);
  }

  // Delete family detail
  async deleteFamilyDetail(familyDetailId: number) {
    return this.api.delete(`/family-details/${familyDetailId}`);
  }

  // Get personnel documents
  async getPersonnelDocuments(armyNo: string) {
    return this.api.get(`/documents/army/${armyNo}`);
  }

  // Get personnel others data (special employment, recommendations, out station employment)
  async getPersonnelOthersData(personnelId: number) {
    return this.api.get(`/others/${personnelId}`);
  }

  // Get current user's personal profile (for personnel role)
  async getPersonalProfile() {
    return this.api.get('/personnel/my-profile');
  }
}

// All Personnel Service - unified Officers + JCO + OR with server-side filters
class AllPersonnelService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  async getAllPersonnel(page: number = 1, limit: number = 1000, search: string = '', filters?: Record<string, unknown>, signal?: AbortSignal) {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (search && search.trim()) params.set('search', search.trim());
    if (filters && Object.keys(filters).length > 0) params.set('filters', JSON.stringify(filters));
    return this.api.get(`/all-personnel?${params.toString()}`, { signal });
  }
}

// Course Service (ViewModel)
class CourseService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Get all courses
  async getAllCourses() {
    return this.api.get('/courses');
  }

  // Get available courses for dropdowns
  async getAvailableCourses() {
    return this.api.get('/courses/available');
  }

  // Get course by ID
  async getCourseById(id: number) {
    return this.api.get(`/courses/${id}`);
  }

  // Create new course
  async createCourse(data: {
    course_code: string;
    course_title: string;
    obtained_grading?: string;
    course_planned?: string;
    remarks?: string;
  }) {
    return this.api.post('/courses', data);
  }

  // Update course
  async updateCourse(id: number, data: {
    course_code?: string;
    course_title?: string;
    obtained_grading?: string;
    course_planned?: string;
    remarks?: string;
  }) {
    return this.api.put(`/courses/${id}`, data);
  }

  // Delete course (soft delete)
  async deleteCourse(id: number) {
    return this.api.delete(`/courses/${id}`);
  }

  // Personnel Course Management (legacy)
  async getPersonnelCourses(personnelId: number) {
    return this.api.get(`/courses/${personnelId}/courses`);
  }

  async createPersonnelCourse(personnelId: number, data: any) {
    return this.api.post(`/courses/${personnelId}/courses`, data);
  }

  async updatePersonnelCourse(courseId: number, data: any) {
    return this.api.put(`/courses/${courseId}`, data);
  }

  async deletePersonnelCourse(courseId: number) {
    return this.api.delete(`/courses/${courseId}`);
  }
}

// Personal Auth Service
class PersonalAuthService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Personal login - army_no + DOB (DDMMYYYY) as default password
  async login(credentials: LoginRequest) {
    const response = await this.api.post<any>('/personal/login', credentials);
    if (response.status === 'success' && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } else {
      throw new Error(response.message || 'Login failed');
    }
  }

  // Change password
  async changePassword(data: { current_password: string; new_password: string }) {
    return this.api.post('/personal/change-password', data);
  }
}

// Dashboard Service
class DashboardService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Get dashboard statistics
  async getDashboardStats() {
    return this.api.get('/dashboard/stats');
  }

  // Get leave chart data
  async getLeaveChartData(leaveType?: string) {
    const queryParam = leaveType && leaveType !== 'all' ? `?leave_type=${leaveType}` : '';
    return this.api.get(`/dashboard/leave-chart${queryParam}`);
  }

  // Get dues data
  async getDuesData() {
    return this.api.get('/dashboard/dues');
  }

  // Get company-wise personnel count (Admin only)
  async getCompanyPersonnelCount() {
    return this.api.get('/dashboard/company-personnel-count');
  }

  // Get category-wise personnel count (Commander only)
  async getCategoryPersonnelCount() {
    return this.api.get('/dashboard/category-personnel-count');
  }

  // Get personnel count by company and status (Admin only)
  async getPersonnelCountByCompanyAndStatus() {
    return this.api.get('/dashboard/personnel-count-by-company-status');
  }

  // Get dues data for courses and out station
  async getDuesCourseOutStationData() {
    return this.api.get('/dashboard/dues-course-outstation');
  }

  // Get leave arrivals data
  async getLeaveArrivalsData() {
    return this.api.get('/dashboard/leave-arrivals');
  }

  // Get upcoming notifications data
  async getUpcomingNotificationsData() {
    return this.api.get('/dashboard/upcoming-notifications');
  }

  // Get today birthdays
  async getTodayBirthdays() {
    return this.api.get('/dashboard/today-birthdays');
  }

  // Get parade state data (dynamic counts by date)
  async getParadeStateData(date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.api.get(`/dashboard/parade-state${params}`);
  }
}

// Leave Service (ViewModel)
class LeaveService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Leave Types
  async getLeaveTypes() {
    return this.api.get('/leave/types');
  }

  async createLeaveType(data: any) {
    return this.api.post('/leave/types', data);
  }

  async updateLeaveType(id: number, data: any) {
    return this.api.put(`/leave/types/${id}`, data);
  }

  async deleteLeaveType(id: number) {
    return this.api.delete(`/leave/types/${id}`);
  }

  // Personal Leave Requests
  async createLeaveRequest(data: any) {
    return this.api.post('/leave/requests', data);
  }

  async getMyLeaveRequests(status?: string) {
    const queryParam = status ? `?status=${status}` : '';
    return this.api.get(`/leave/requests/my${queryParam}`);
  }

  async updateLeaveRequest(id: number, data: any) {
    return this.api.put(`/leave/requests/${id}`, data);
  }

  async deleteLeaveRequest(id: number) {
    return this.api.delete(`/leave/requests/${id}`);
  }

  // Commander Routes
  async getCommanderLeaveRequests(status?: string) {
    const queryParam = status ? `?status=${status}` : '';
    return this.api.get(`/leave/requests/commander${queryParam}`);
  }

  // Approval Queue (deprecated - use getCommanderLeaveRequests instead)
  async getApprovalQueue() {
    return this.api.get('/leave/requests/approval');
  }

  async approveLeaveRequest(approvalId: number, data: any) {
    return this.api.put(`/leave/approval/${approvalId}`, data);
  }

  // Approve or Reject Leave Request
  async approveRejectLeaveRequest(leaveId: number, data: {
    action: 'approve' | 'reject';
    rejection_reason?: string;
  }) {
    return this.api.put(`/leave/requests/${leaveId}/action`, data);
  }

  // Admin Management
  async getAllLeaveRequests(filters?: {
    status?: string;
    personnel_id?: number;
    leave_type_id?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.personnel_id) params.append('personnel_id', filters.personnel_id.toString());
    if (filters?.leave_type_id) params.append('leave_type_id', filters.leave_type_id);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString();
    return this.api.get(`/leave/requests/all${queryString ? `?${queryString}` : ''}`);
  }

  // Utility
  async getSupervisors() {
    return this.api.get('/leave/supervisors');
  }

  // Get my approver (personnel gets commander, commander gets admin)
  async getMyApprover() {
    return this.api.get('/leave/my-approver');
  }

  // Bulk upload past leave details
  async bulkUploadPastLeaves(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post('/leave/bulk-upload', formData);
  }

  // Create leave extension
  async createLeaveExtension(data: {
    leave_request_id: number;
    new_end_date: string;
    extension_reason: string;
  }) {
    return this.api.post('/leave-extensions', data);
  }

  // Download template for bulk upload
  async downloadTemplate() {
    const url = `${API_BASE_URL}/leave/bulk-upload/template`;
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to download template' }));
      throw new Error(error.message || 'Failed to download template');
    }

    return {
      data: await response.blob(),
      status: response.status
    };
  }
}

// User Service (ViewModel) - For user role functionality
class UserService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // User Profile
  async getUserProfile() {
    return this.api.get('/user/profile');
  }

  async getUserSupervisor() {
    return this.api.get('/user/supervisor');
  }

  // User Leave Requests
  async getUserLeaveRequests() {
    return this.api.get('/user/leave-requests');
  }

  async applyForLeave(data: any) {
    return this.api.post('/user/leave-requests', data);
  }

  // User Courses
  async getUserCourses() {
    return this.api.get('/user/courses');
  }

  async getAvailableCourses() {
    return this.api.get('/user/courses/available');
  }

  async optInForCourse(data: any) {
    return this.api.post('/user/courses/opt-in', data);
  }
}

// Rank Service (ViewModel)
class RankService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Get all ranks
  async getAllRanks() {
    return this.api.get('/ranks');
  }

  // Get ranks by category
  async getRanksByCategory(category: 'Other Ranks' | 'Officers') {
    return this.api.get(`/ranks/category/${category}`);
  }

  // Get rank by ID
  async getRankById(id: number) {
    return this.api.get(`/ranks/${id}`);
  }

  // Create new rank (Admin only)
  async createRank(data: any) {
    return this.api.post('/ranks', data);
  }

  // Update rank (Admin only)
  async updateRank(id: number, data: any) {
    return this.api.put(`/ranks/${id}`, data);
  }

  // Delete rank (Admin only)
  async deleteRank(id: number) {
    return this.api.delete(`/ranks/${id}`);
  }
}

// Personnel Education Service
export class PersonnelEducationService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Get all education records for a personnel
  async getPersonnelEducation(personnelId: number): Promise<ApiResponse<any>> {
    return this.api.get(`/personnel-education/personnel/${personnelId}`);
  }

  // Get education record by ID
  async getEducationById(id: number): Promise<ApiResponse<any>> {
    return this.api.get(`/personnel-education/${id}`);
  }

  // Create new education record
  async createEducation(data: any): Promise<ApiResponse<any>> {
    return this.api.post('/personnel-education', data);
  }

  // Update education record
  async updateEducation(id: number, data: any): Promise<ApiResponse<any>> {
    return this.api.put(`/personnel-education/${id}`, data);
  }

  // Delete education record
  async deleteEducation(id: number): Promise<ApiResponse<any>> {
    return this.api.delete(`/personnel-education/${id}`);
  }
}

// Personnel Sports Service
export class PersonnelSportsService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Get all sports records for a personnel
  async getPersonnelSports(personnelId: number): Promise<ApiResponse<any>> {
    return this.api.get(`/personnel-sports/personnel/${personnelId}`);
  }

  // Get sports record by ID
  async getSportsById(id: number): Promise<ApiResponse<any>> {
    return this.api.get(`/personnel-sports/${id}`);
  }

  // Create new sports record
  async createSports(data: any): Promise<ApiResponse<any>> {
    return this.api.post('/personnel-sports', data);
  }

  // Update sports record
  async updateSports(id: number, data: any): Promise<ApiResponse<any>> {
    return this.api.put(`/personnel-sports/${id}`, data);
  }

  // Delete sports record
  async deleteSports(id: number): Promise<ApiResponse<any>> {
    return this.api.delete(`/personnel-sports/${id}`);
  }
}

// Rank Category Service
export class RankCategoryService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Get all rank categories
  async getAllRankCategories(): Promise<ApiResponse<any>> {
    return this.api.get('/rank-categories');
  }

  // Get rank category by ID
  async getRankCategoryById(id: number): Promise<ApiResponse<any>> {
    return this.api.get(`/rank-categories/${id}`);
  }

  // Create new rank category
  async createRankCategory(data: any): Promise<ApiResponse<any>> {
    return this.api.post('/rank-categories', data);
  }

  // Update rank category
  async updateRankCategory(id: number, data: any): Promise<ApiResponse<any>> {
    return this.api.put(`/rank-categories/${id}`, data);
  }

  // Delete rank category
  async deleteRankCategory(id: number): Promise<ApiResponse<any>> {
    return this.api.delete(`/rank-categories/${id}`);
  }
}

// Medical Category Service
export class MedicalCategoryService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Get all medical categories for dropdown
  async getAllMedicalCategoriesForDropdown(): Promise<ApiResponse<any>> {
    return this.api.get('/medical-categories/dropdown');
  }

  // Get all medical categories
  async getAllMedicalCategories(): Promise<ApiResponse<any>> {
    return this.api.get('/medical-categories');
  }

  // Get medical category by ID
  async getMedicalCategoryById(id: number): Promise<ApiResponse<any>> {
    return this.api.get(`/medical-categories/${id}`);
  }

  // Create new medical category (Admin only)
  async createMedicalCategory(data: any): Promise<ApiResponse<any>> {
    return this.api.post('/medical-categories', data);
  }

  // Update medical category (Admin only)
  async updateMedicalCategory(id: number, data: any): Promise<ApiResponse<any>> {
    return this.api.put(`/medical-categories/${id}`, data);
  }

  // Delete medical category (Admin only)
  async deleteMedicalCategory(id: number): Promise<ApiResponse<any>> {
    return this.api.delete(`/medical-categories/${id}`);
  }
}

// Grade Service
class GradeService {
  private api: ApiService;
   constructor() {
    this.api = new ApiService(API_BASE_URL);
  }


  // Get all grades
  async getAllGrades() {
    return this.api.get('/grades');
  }

  // Get grade by ID
  async getGradeById(id: number) {
    return this.api.get(`/grades/${id}`);
  }
 

}
// Officers Service
class OfficersService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }
   // Get all officers with pagination, search, and advanced filters
  async getAllOfficers(page: number = 1, limit: number = 10, search: string = '', filters?: any) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(filters && { filters: JSON.stringify(filters) })
    });
    return this.api.get(`/officers?${params.toString()}`);
  }
  // Get officer by ID
  async getOfficerById(id: number) {
    return this.api.get(`/officers/${id}`);
  }

  // Create new officer
  async createOfficer(data: any) {
    return this.api.post('/officers', data);
  }

  // Update officer
  async updateOfficer(id: number, data: any) {
    return this.api.put(`/officers/${id}`, data);
  }

  // Delete officer
  async deleteOfficer(id: number) {
    return this.api.delete(`/officers/${id}`);
  }
}

// Admins Service
class AdminsService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Get all admins with pagination and search
  async getAllAdmins(page: number = 1, limit: number = 10, search: string = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    return this.api.get(`/admins?${params.toString()}`);
  }

  // Get admin by ID
  async getAdminById(id: number) {
    return this.api.get(`/admins/${id}`);
  }

  // Create new admin
  async createAdmin(data: any) {
    return this.api.post('/admins', data);
  }

  // Update admin
  async updateAdmin(id: number, data: any) {
    return this.api.put(`/admins/${id}`, data);
  }

  // Delete admin
  async deleteAdmin(id: number) {
    return this.api.delete(`/admins/${id}`);
  }
}

// Personnel JCO Service (JCO and Other Ranks)
class PersonnelJCOService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Get all personnel (JCO and OR) with pagination, search, and advanced filters
  async getAllPersonnel(page: number = 1, limit: number = 10, search: string = '', filters?: any) {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (search && search.trim()) params.set('search', search.trim());
    if (filters && Object.keys(filters).length > 0) params.set('filters', JSON.stringify(filters));
    return this.api.get(`/personnel-jco?${params.toString()}`);
  }

  // Get personnel by ID
  async getPersonnelById(id: number) {
    return this.api.get(`/personnel-jco/${id}`);
  }

  // Create new personnel (JCO or OR)
  async createPersonnel(data: any) {
    return this.api.post('/personnel-jco', data);
  }

  // Update personnel
  async updatePersonnel(id: number, data: any) {
    return this.api.put(`/personnel-jco/${id}`, data);
  }

  // Delete personnel
  async deletePersonnel(id: number) {
    return this.api.delete(`/personnel-jco/${id}`);
  }
}

// Quick Filters Service
class QuickFiltersService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  // Get quick filtered personnel
  async getQuickFilteredPersonnel(params: {
    company_id?: number;
    rank_id?: number;
    platoon_id?: number;
    tradesman_id?: number;
    education_type?: string;
    sports_event_name?: string;
    blood_group?: string;
    status?: string; // On ERE, On Course, On Leave, Out Station, Available
    formation_category?: string; // For Out Station: 6 categories
    as_of_date?: string; // YYYY-MM-DD - filter status as of this date
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params.company_id != null) queryParams.append('company_id', params.company_id.toString());
    if (params.rank_id != null) queryParams.append('rank_id', params.rank_id.toString());
    if (params.platoon_id != null) queryParams.append('platoon_id', params.platoon_id.toString());
    if (params.tradesman_id != null) queryParams.append('tradesman_id', params.tradesman_id.toString());
    if (params.education_type) queryParams.append('education_type', params.education_type);
    if (params.sports_event_name) queryParams.append('sports_event_name', params.sports_event_name);
    if (params.blood_group) queryParams.append('blood_group', params.blood_group);
    if (params.status) queryParams.append('status', params.status);
    if (params.formation_category) queryParams.append('formation_category', params.formation_category);
    if (params.as_of_date) queryParams.append('as_of_date', params.as_of_date);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    return this.api.get(`/quick-filters/personnel?${queryParams.toString()}`);
  }

  // Get status report - personnel grouped by status (ERE, Course, Leave, Out Station, Available) for a date
  async getStatusReport(asOfDate?: string) {
    const queryParams = new URLSearchParams();
    if (asOfDate) queryParams.append('as_of_date', asOfDate);
    return this.api.get(`/quick-filters/status-report?${queryParams.toString()}`);
  }
}

// Image Service
class ImageService {
  private api: ApiService;
  private baseURL: string;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
    this.baseURL = API_BASE_URL;
  }

  // Upload image(s) - supports single or multiple files (max 10)
  // For login: use folder 'login-left' or 'login-right' for specific side uploads
  async uploadImage(files: File | File[], folder: 'dashboard' | 'personnel' | 'login' | 'login-left' | 'login-right') {
    const formData = new FormData();
    
    // Handle both single file and array of files
    const fileArray = Array.isArray(files) ? files : [files];
    
    // Append all files with the same field name 'files'
    fileArray.forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('folder', folder);

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/images/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image(s)');
    }

    return data;
  }

  // Get images for a folder (login folder is public - use getLoginImages for unauthenticated access)
  async getImages(folder: 'dashboard' | 'personnel' | 'login') {
    return this.api.get(`/images/${folder}`);
  }

  // Get login images (public - no auth required, for login page)
  async getLoginImages() {
    const response = await fetch(`${this.baseURL}/images/login`, { method: 'GET' });
    const raw = await response.json();
    const decrypted = tryDecryptResponse<ApiResponse<any>>(raw, response.headers);
    return decrypted ?? raw;
  }

  // Delete image (folder can be login-left or login-right for login page images)
  async deleteImage(folder: 'dashboard' | 'personnel' | 'login' | 'login-left' | 'login-right', filename: string) {
    return this.api.delete(`/images/${folder}/${filename}`);
  }
}

// WhatsNew Documents Service
class WhatsNewService {
  private api: ApiService;
  private baseURL: string;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
    this.baseURL = API_BASE_URL;
  }

  async getDocuments() {
    return this.api.get('/whats-new');
  }

  async uploadDocuments(files: File | File[]) {
    const formData = new FormData();
    const fileArray = Array.isArray(files) ? files : [files];
    fileArray.forEach(file => formData.append('files', file));

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.baseURL}/whats-new/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to upload documents');
    return data;
  }

  async deleteDocument(filename: string) {
    return this.api.delete(`/whats-new/${filename}`);
  }
}

// Export service instances
export const authService = new AuthService();
export const personnelService = new PersonnelService();
export const allPersonnelService = new AllPersonnelService();
export const officersService = new OfficersService();
export const adminsService = new AdminsService();
export const personnelJCOService = new PersonnelJCOService();
export const courseService = new CourseService();
export const personalAuthService = new PersonalAuthService();
export const leaveService = new LeaveService();
export const dashboardService = new DashboardService();
export const userService = new UserService();
export const rankService = new RankService();
export const rankCategoryService = new RankCategoryService();
export const medicalCategoryService = new MedicalCategoryService();
export const gradeService = new GradeService();
export const personnelEducationService = new PersonnelEducationService();
export const personnelSportsService = new PersonnelSportsService();
export const quickFiltersService = new QuickFiltersService();
export const imageService = new ImageService();
export const whatsNewService = new WhatsNewService();

// Data Management (backups) - admin only
export interface BackupItem {
  filename: string;
  date: string;
}

class DataManagementService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService(API_BASE_URL);
  }

  async listBackups(): Promise<ApiResponse<{ backups: BackupItem[] }>> {
    return this.api.get('/data-management/backups');
  }

  async triggerBackup(): Promise<ApiResponse<{ filename: string }>> {
    return this.api.post('/data-management/backups/trigger', {});
  }

  async deleteBackup(filename: string): Promise<ApiResponse<null>> {
    return this.api.delete(`/data-management/backups/${encodeURIComponent(filename)}`);
  }
}

export const dataManagementService = new DataManagementService();

/** Download a backup file by filename (uses auth token, triggers browser download). */
export async function downloadBackup(filename: string): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  const url = `${API_BASE_URL}/data-management/backups/${encodeURIComponent(filename)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = res.statusText;
    try {
      const j = JSON.parse(text);
      if (j.message) msg = j.message;
    } catch (_) {}
    throw new Error(msg);
  }
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Export the base API service for direct use
export const api = new ApiService(API_BASE_URL);

// Server time - for year calculations using server date/time (no auth required)
export interface ServerTimeResponse {
  serverTime: string;
  timezone: string;
}

export async function getServerTime(): Promise<{
  success: boolean;
  serverTime?: string;
  message?: string;
}> {
  try {
    const res = await api.get<ServerTimeResponse>('/server-time');
    if (res.status === 'success' && res.data?.serverTime) {
      return { success: true, serverTime: res.data.serverTime };
    }
    return { success: false, message: res.message || 'Failed to get server time' };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// Static administrator login (no DB, hardcoded credentials in API)
export const ADMIN_STATIC_TOKEN_KEY = 'ipmas_static_admin_token';

// Public administrator logo upload (no auth required)
export async function administratorUploadLogo(file: File): Promise<{ success: boolean; filePath?: string; message?: string }> {
  try {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('folder', 'app-logo');

    const response = await fetch(`${API_BASE_URL}/images/administrator/upload`, {
      method: 'POST',
      body: formData,
    });

    const raw = await response.json();
    
    // Decrypt response if encrypted
    const data = tryDecryptResponse<ApiResponse<{ file_path: string }>>(raw, response.headers);
    
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to upload logo' };
    }

    // Handle response structure: data can be an object or array
    let filePath: string | undefined;
    if (data.data) {
      if (Array.isArray(data.data)) {
        filePath = data.data[0]?.file_path;
      } else if (typeof data.data === 'object') {
        filePath = (data.data as any)?.file_path;
      }
    }
    
    if (filePath) {
      return { success: true, filePath };
    }
    
    // Log for debugging
    console.error('Upload response structure:', JSON.stringify(data, null, 2));
    return { 
      success: false, 
      message: `Upload succeeded but could not get file path. Response: ${JSON.stringify(data)}` 
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function administratorStaticLogin(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/administrator-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const raw = await res.json();
    
    // Decrypt response if encrypted
    const data = tryDecryptResponse<ApiResponse<{ token: string }>>(raw, res.headers);
    
    if (data.status === 'success' && data.data?.token) {
      return { success: true, token: data.data.token };
    }
    return { success: false, message: data.message || 'Login failed' };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// Administrator admin management (no auth required)
export interface AdministratorAdmin {
  id: number;
  army_no: string;
  name: string;
  rank: string;
  unit?: string;
  email?: string;
  phone?: string;
  dob?: string;
  doe?: string;
}

export async function administratorGetAdmins(): Promise<{ success: boolean; admins?: AdministratorAdmin[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/administrator/admins`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const raw = await res.json();
    const data = tryDecryptResponse<ApiResponse<{ personnel: AdministratorAdmin[] }>>(raw, res.headers);
    
    if (data.status === 'success' && data.data) {
      const personnel = (data.data as any)?.personnel;
      return { success: true, admins: Array.isArray(personnel) ? personnel : [] };
    }
    return { success: false, message: data.message || 'Failed to fetch admins' };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// App Settings API (public endpoints)
export interface AppSettings {
  app_name: string;
  app_logo_url?: string;
  /** Login page left portrait (CEO) */
  login_left_name?: string;
  login_left_army_number?: string;
  login_left_rank?: string;
  /** Login page right portrait (Director) */
  login_right_name?: string;
  login_right_army_number?: string;
  login_right_rank?: string;
}

export async function getAppSettings(): Promise<{ success: boolean; settings?: AppSettings; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/app-settings`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const raw = await res.json();
    const data = tryDecryptResponse<ApiResponse<AppSettings>>(raw, res.headers);
    
    if (data.status === 'success' && data.data) {
      return { success: true, settings: data.data as AppSettings };
    }
    return { success: false, message: data.message || 'Failed to fetch app settings' };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function updateAppSettings(
  settings: Partial<AppSettings>
): Promise<{ success: boolean; settings?: AppSettings; message?: string }> {
  try {
    // Prepare payload - convert undefined to empty string for logo_url to clear it
    const payload: any = {};
    if (settings.app_name !== undefined) {
      payload.app_name = settings.app_name;
    }
    if (settings.app_logo_url !== undefined) {
      // Send empty string to clear logo, or the URL to set it
      payload.app_logo_url = settings.app_logo_url || "";
    }
    if (settings.login_left_name !== undefined) payload.login_left_name = settings.login_left_name;
    if (settings.login_left_army_number !== undefined) payload.login_left_army_number = settings.login_left_army_number;
    if (settings.login_left_rank !== undefined) payload.login_left_rank = settings.login_left_rank;
    if (settings.login_right_name !== undefined) payload.login_right_name = settings.login_right_name;
    if (settings.login_right_army_number !== undefined) payload.login_right_army_number = settings.login_right_army_number;
    if (settings.login_right_rank !== undefined) payload.login_right_rank = settings.login_right_rank;

    const encryptedPayload = encryptRequestPayload(payload);
    const res = await fetch(`${API_BASE_URL}/app-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encryptedPayload),
    });

    const raw = await res.json();
    const data = tryDecryptResponse<ApiResponse<AppSettings>>(raw, res.headers);
    
    if (data.status === 'success' && data.data) {
      return { success: true, settings: data.data as AppSettings };
    }
    return { success: false, message: data.message || 'Failed to update app settings' };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// Licensing API (public endpoints for administrator page)
export interface LicensingData {
  license_key: string;
  os?: string; // "Windows" | "Linux"
  id?: number;
  updated_at?: string;
}

export async function getLicensing(): Promise<{ success: boolean; data?: LicensingData; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/licensing`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const raw = await res.json();
    const decrypted = tryDecryptResponse<ApiResponse<LicensingData>>(raw, res.headers);
    if (decrypted.status === 'success' && decrypted.data) {
      const d = decrypted.data as LicensingData;
      return { success: true, data: { license_key: d.license_key || '', os: d.os || '', id: d.id, updated_at: d.updated_at } };
    }
    return { success: false, message: decrypted.message || 'Failed to fetch licensing' };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function updateLicensing(licenseKey: string, os?: string): Promise<{ success: boolean; data?: LicensingData; message?: string }> {
  try {
    const body: { license_key: string; os?: string } = { license_key: licenseKey };
    if (os !== undefined) body.os = os;
    const payload = encryptRequestPayload(body);
    const res = await fetch(`${API_BASE_URL}/licensing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const raw = await res.json();
    const decrypted = tryDecryptResponse<ApiResponse<LicensingData>>(raw, res.headers);
    if (decrypted.status === 'success' && decrypted.data) {
      const d = decrypted.data as LicensingData;
      return { success: true, data: { license_key: d.license_key || '', os: d.os || '', id: d.id, updated_at: d.updated_at } };
    }
    return { success: false, message: decrypted.message || 'Failed to update licensing' };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Network error' };
  }
}

// Validate license key: POST with license_key, returns decrypted value or error
export interface ValidateLicensingResult {
  valid: boolean;
  decrypted_value: string;
  error?: string;
}

export async function validateLicensingKey(licenseKey: string): Promise<{
  success: boolean;
  data?: ValidateLicensingResult;
  message?: string;
}> {
  try {
    const payload = encryptRequestPayload({ license_key: licenseKey.trim() });
    const res = await fetch(`${API_BASE_URL}/licensing/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const raw = await res.json();
    const decrypted = tryDecryptResponse<ApiResponse<ValidateLicensingResult>>(raw, res.headers);
    if (decrypted.status === 'success' && decrypted.data) {
      return { success: true, data: decrypted.data as ValidateLicensingResult };
    }
    return { success: false, message: decrypted.message || 'Validation request failed' };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function administratorCreateAdmin(
  adminData: {
    army_no: string;
    name: string;
    rank?: string;
    unit?: string;
    email?: string;
    phone?: string;
    dob?: string;
    doe?: string;
  }
): Promise<{ success: boolean; admin?: AdministratorAdmin; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/administrator/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData),
    });

    const raw = await res.json();
    const data = tryDecryptResponse<ApiResponse<{ personnel: AdministratorAdmin }>>(raw, res.headers);
    
    if (data.status === 'success' && data.data) {
      const personnel = (data.data as any)?.personnel;
      return { success: true, admin: personnel };
    }
    return { success: false, message: data.message || 'Failed to create admin' };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// Export types
export type { ApiResponse, AuthResponse, LoginRequest }; 