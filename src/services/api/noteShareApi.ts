import api from './api';

const noteShareApi = {
  generate: () => api.post<{ token: string; createdAt: string }>('/api/notes-share/generate', {}),
  revoke: () => api.delete('/api/notes-share/revoke'),
};

export default noteShareApi;
