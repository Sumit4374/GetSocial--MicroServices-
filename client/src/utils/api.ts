import { User, Post, Comment, ChatConversation, ChatMessage } from '../types';

const API_BASE_URL = 'http://localhost:8080';

interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
}

interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
}

class ApiClient {
  private getAuthToken() {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers || {});
    const token = this.getAuthToken();

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const isFormData = options.body instanceof FormData;
    if (options.body && !isFormData && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth-service/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
  }

  async register(username: string, email: string, password: string): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth-service/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth-service/api/auth/me');
  }

  // User endpoints
  async getUser(id: string): Promise<User> {
    return this.request<User>(`/user-service/api/users/${id}`);
  }

  async getUserBasic(id: string): Promise<User> {
    return this.request<User>(`/user-service/api/users/${id}/basic`);
  }

  async updateUser(id: string, data: any): Promise<User> {
    return this.request<User>(`/user-service/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async followUser(userId: string, targetId: string): Promise<any> {
    return this.request(`/user-service/api/users/${userId}/follow/${targetId}`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string, targetId: string): Promise<any> {
    return this.request(`/user-service/api/users/${userId}/unfollow/${targetId}`, {
      method: 'DELETE',
    });
  }

  async getFollowers(id: string): Promise<User[]> {
    return this.request<User[]>(`/user-service/api/users/${id}/followers`);
  }

  async getFollowing(id: string): Promise<User[]> {
    return this.request<User[]>(`/user-service/api/users/${id}/following`);
  }

  async isFollowing(userId: string, otherUserId: string): Promise<{ isFollowing: boolean }> {
    return this.request<{ isFollowing: boolean }>(`/user-service/api/users/${userId}/is-following/${otherUserId}`);
  }

  // Post endpoints
  async createPost(
    data: FormData | Record<string, unknown>,
    userId: number
  ): Promise<Post> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<Post>('/post-service/api/post/create', {
      method: 'POST',
      body,
      headers: {
        'X-User-Id': String(userId),
      },
    });
  }

  async getPost(id: string): Promise<Post> {
    return this.request<Post>(`/post-service/api/posts/${id}`);
  }

  async deletePost(id: string): Promise<void> {
    return this.request(`/post-service/api/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return this.request<Post[]>(`/post-service/api/post/${userId}`);
  }

  async getFeed(userId: number): Promise<Post[]> {
    return this.request<Post[]>(`/post-service/api/post/feed/${userId}`);
  }

  // Like endpoints
  async likePost(postId: string) {
    return this.request(`/like-service/api/likes/${postId}`, {
      method: 'POST',
    });
  }

  async unlikePost(postId: string) {
    return this.request(`/like-service/api/likes/${postId}`, {
      method: 'DELETE',
    });
  }

  async getPostLikes(postId: string) {
    return this.request(`/like-service/api/likes/${postId}`);
  }

  // Comment endpoints
  async addComment(postId: string | number, userId: number, content: string) {
    return this.request(`/comment-service/api/comment/${postId}/user/${userId}`, {
      method: 'POST',
      body: content,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  async getComments(postId: string | number): Promise<Comment[]> {
    return this.request<Comment[]>(`/comment-service/api/comment/${postId}`);
  }

  async deleteComment(commentId: string | number) {
    return this.request(`/comment-service/api/comment/${commentId}/delete`, {
      method: 'DELETE',
    });
  }

  // Chat endpoints
  async requestChat(data: any) {
    return this.request('/chat-service/api/chats/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async acceptChatRequest(conversationId: string) {
    return this.request(`/chat-service/api/chats/${conversationId}/accept`, {
      method: 'POST',
    });
  }

  async getConversations(): Promise<ChatConversation[]> {
    return this.request<ChatConversation[]>('/chat-service/api/chats');
  }

  async sendMessage(data: any) {
    return this.request('/chat-service/api/chats/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(`/chat-service/api/chats/${conversationId}/messages`);
  }
}

export const apiClient = new ApiClient();