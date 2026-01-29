const BASE_URL = 'http://localhost:3000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Something went wrong' };
    }

    return { data };
  } catch (error) {
    return { error: 'Network error. Please try again.' };
  }
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  // Products
  getProducts: () => request<Product[]>('/products'),

  getProduct: (id: string) => request<Product>(`/products/${id}`),

  createProduct: (product: Omit<Product, 'id'>) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  updateProduct: (id: string, product: Partial<Product>) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),

  deleteProduct: (id: string) =>
    request<void>(`/products/${id}`, {
      method: 'DELETE',
    }),

  // Categories
  getCategories: () => request<Category[]>('/categories'),

  // Dashboard stats
  getDashboardStats: () => request<DashboardStats>('/dashboard/stats'),
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  brand: string;
  description: string;
  specs: Record<string, string>;
  image?: string;
  stock: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: number;
}
