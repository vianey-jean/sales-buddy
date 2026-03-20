import api from '../../service/api';

export interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  address?: string;
  phone?: string;
  profilePhoto?: string;
}

const profileApi = {
  async getProfile(): Promise<ProfileData> {
    const response = await api.get('/api/profile');
    return response.data;
  },

  async updateProfile(data: Partial<ProfileData>): Promise<{ success: boolean; user: ProfileData }> {
    const response = await api.put('/api/profile', data);
    return response.data;
  },

  async uploadPhoto(file: File): Promise<{ success: boolean; photoUrl: string; user: ProfileData }> {
    const formData = new FormData();
    formData.append('photo', file);
    const token = localStorage.getItem('token');
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
    const response = await fetch(`${baseURL}/api/profile/photo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },

  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> {
    const response = await api.put('/api/profile/password', data);
    return response.data;
  },

  getPhotoUrl(path: string | undefined): string {
    if (!path) return '';
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
    return `${baseURL}${path}`;
  }
};

export default profileApi;
