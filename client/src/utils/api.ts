const API_BASE_URL = 'http://localhost:8080';

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
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
  async login(email: string, password: string) {
    return this.request('/auth-service/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string) {
    return this.request('/auth-service/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth-service/api/auth/me');
  }

  // User endpoints
  async getUser(id: string) {
    return this.request(`/user-service/api/users/${id}`);
  }

  async getUserBasic(id: string) {
    return this.request(`/user-service/api/users/${id}/basic`);
  }

  async updateUser(id: string, data: any) {
    return this.request(`/user-service/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async followUser(userId: string, targetId: string) {
    return this.request(`/user-service/api/users/${userId}/follow/${targetId}`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string, targetId: string) {
    return this.request(`/user-service/api/users/${userId}/unfollow/${targetId}`, {
      method: 'DELETE',
    });
  }

  async getFollowers(id: string) {
    return this.request(`/user-service/api/users/${id}/followers`);
  }

  async getFollowing(id: string) {
    return this.request(`/user-service/api/users/${id}/following`);
  }

  async isFollowing(userId: string, otherUserId: string) {
    return this.request(`/user-service/api/users/${userId}/is-following/${otherUserId}`);
  }

  // Post endpoints
  async createPost(data: any) {
    return this.request('/post-service/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPost(id: string) {
    return this.request(`/post-service/api/posts/${id}`);
  }

  async deletePost(id: string) {
    return this.request(`/post-service/api/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserPosts(userId: string) {
    return this.request(`/post-service/api/posts/user/${userId}`);
  }

  async getFeed(userId: string) {
    return this.request(`/post-service/api/posts/feed/${userId}`);
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
  async addComment(postId: string, content: string) {
    return this.request(`/comment-service/api/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getComments(postId: string) {
    return this.request(`/comment-service/api/comments/${postId}`);
  }

  async deleteComment(commentId: string) {
    return this.request(`/comment-service/api/comments/${commentId}`, {
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

  async getConversations() {
    return this.request('/chat-service/api/chats');
  }

  async sendMessage(data: any) {
    return this.request('/chat-service/api/chats/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessages(conversationId: string) {
    return this.request(`/chat-service/api/chats/${conversationId}/messages`);
  }
}

export const apiClient = new ApiClient();