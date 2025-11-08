const API_URL = 'http://localhost:5000/api'; // Adjust if your backend runs elsewhere

interface RequestOptions extends RequestInit {
  data?: any;
}

const api = async (endpoint: string, { data, ...customConfig }: RequestOptions = {}) => {
  const user = localStorage.getItem('user');
  const token = user ? JSON.parse(user).token : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    if (!response.ok) {
        const errorData = await response.json();
        return Promise.reject(errorData);
    }
    // Handle cases with no response body (e.g., 204 No Content)
    if (response.status === 204) {
        return null;
    }
    return response.json();
  } catch (err) {
    return Promise.reject(err);
  }
};

export default api;
