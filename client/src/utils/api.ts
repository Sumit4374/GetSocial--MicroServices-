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

  private normalizeUser(payload: any, fallbackId?: number): User {
    const id =
      typeof payload?.userId === 'number'
        ? payload.userId
        : typeof payload?.id === 'number'
        ? payload.id
        : typeof fallbackId === 'number'
        ? fallbackId
        : 0;

    const username =
      typeof payload?.username === 'string' && payload.username.trim().length > 0
        ? payload.username
        : typeof payload?.name === 'string' && payload.name.trim().length > 0
        ? payload.name
        : typeof id === 'number' && id > 0
        ? `User ${id}`
        : 'Unknown User';

    const profilePicture =
      payload?.profilePicture ?? payload?.profilePicURL ?? payload?.profilePicUrl ?? payload?.avatarUrl;

    const followerCount =
      typeof payload?.followerCount === 'number'
        ? payload.followerCount
        : Array.isArray(payload?.followers)
        ? payload.followers.length
        : undefined;

    const followingCount =
      typeof payload?.followingCount === 'number'
        ? payload.followingCount
        : Array.isArray(payload?.following)
        ? payload.following.length
        : undefined;

    const postCount =
      typeof payload?.postCount === 'number'
        ? payload.postCount
        : typeof payload?.posts === 'number'
        ? payload.posts
        : undefined;

    return {
      id,
      username,
      email: typeof payload?.email === 'string' ? payload.email : undefined,
      profilePicture: typeof profilePicture === 'string' ? profilePicture : undefined,
      bio: typeof payload?.bio === 'string' ? payload.bio : undefined,
      followerCount,
      followingCount,
      postCount,
      createdAt: typeof payload?.createdAt === 'string' ? payload.createdAt : undefined,
    };
  }

  private normalizeDateTime(value: any): string | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }

    if (typeof value === 'object') {
      const year = typeof value.year === 'number' ? value.year : undefined;
      const monthValue = typeof value.monthValue === 'number'
        ? value.monthValue
        : typeof value.month === 'number'
        ? value.month
        : undefined;
      const day = typeof value.dayOfMonth === 'number'
        ? value.dayOfMonth
        : typeof value.day === 'number'
        ? value.day
        : undefined;
      if (year && monthValue && day) {
        const hour = typeof value.hour === 'number' ? value.hour : 0;
        const minute = typeof value.minute === 'number' ? value.minute : 0;
        const second = typeof value.second === 'number' ? value.second : 0;
        const date = new Date(Date.UTC(year, monthValue - 1, day, hour, minute, second));
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
      }
    }

    return null;
  }

  private toNumber(value: any): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        return undefined;
      }
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
  }

  private normalizePost(payload: any): Post {
    const id = this.toNumber(payload?.id) ?? 0;
    const userId =
      this.toNumber(payload?.userId) ??
      this.toNumber(payload?.authorId) ??
      this.toNumber(payload?.user?.id) ??
      this.toNumber(payload?.user?.userId) ??
      0;

    const likeCount =
      this.toNumber(payload?.likeCount) ??
      this.toNumber(payload?.likesCount) ??
      (Array.isArray(payload?.likes) ? payload.likes.length : undefined) ??
      0;

    const commentCount =
      this.toNumber(payload?.commentCount) ??
      this.toNumber(payload?.commentsCount) ??
      (Array.isArray(payload?.comments) ? payload.comments.length : undefined) ??
      0;

    const mediaUrl =
      typeof payload?.mediaUrl === 'string'
        ? payload.mediaUrl
        : typeof payload?.imageUrl === 'string'
        ? payload.imageUrl
        : undefined;

    const content = typeof payload?.content === 'string' ? payload.content : undefined;
    const caption = typeof payload?.caption === 'string' ? payload.caption : undefined;

    const userDetails = payload?.user ? this.normalizeUser(payload.user, userId) : undefined;

    return {
      id,
      userId,
      content,
      caption,
      imageUrl: typeof payload?.imageUrl === 'string' ? payload.imageUrl : undefined,
      mediaUrl,
      createdAt: this.normalizeDateTime(payload?.createdAt),
      likeCount,
      commentCount,
      isLiked: Boolean(payload?.isLiked ?? payload?.liked ?? payload?.isLikedByCurrentUser ?? false),
      user: userDetails,
    };
  }

  private async enrichPostsWithUsers(rawPosts: any[], viewerId?: number): Promise<Post[]> {
    if (!Array.isArray(rawPosts) || rawPosts.length === 0) {
      return [];
    }

    const normalized = rawPosts.map((post) => this.normalizePost(post));
    const missingUserIds = Array.from(
      new Set(
        normalized
          .filter((post) => !post.user && typeof post.userId === 'number' && post.userId > 0)
          .map((post) => post.userId)
      )
    );

    if (missingUserIds.length > 0) {
      const userEntries = await Promise.all(
        missingUserIds.map(async (id) => {
          try {
            const user = await this.getUserBasic(id);
            return [id, user] as const;
          } catch (error) {
            console.error(`Failed to fetch basics for user ${id}`, error);
            return null;
          }
        })
      );

      const userMap = new Map<number, User>(
        userEntries.filter((entry): entry is [number, User] => entry !== null)
      );

      normalized.forEach((post) => {
        if (!post.user) {
          const fallbackUser = userMap.get(post.userId);
          post.user = fallbackUser ?? this.normalizeUser({ id: post.userId }, post.userId);
        }
      });
    } else {
      normalized.forEach((post) => {
        if (!post.user) {
          post.user = this.normalizeUser({ id: post.userId }, post.userId);
        }
      });
    }

    await this.enrichPostsWithEngagement(normalized, viewerId);

    return normalized;
  }

  private async enrichPostsWithEngagement(posts: Post[], viewerId?: number): Promise<void> {
    await Promise.all(
      posts.map(async (post) => {
        if (!post || typeof post.id !== 'number') {
          return;
        }

        try {
          post.likeCount = await this.getPostLikes(post.id);
        } catch (error) {
          console.error(`Failed to fetch like count for post ${post.id}:`, error);
        }

        if (typeof viewerId === 'number') {
          try {
            post.isLiked = await this.isPostLikedByUser(post.id, viewerId);
          } catch (error) {
            console.error(`Failed to fetch like status for post ${post.id}:`, error);
          }
        }

        try {
          post.commentCount = await this.getPostCommentCount(post.id);
        } catch (error) {
          console.error(`Failed to fetch comment count for post ${post.id}:`, error);
        }
      })
    );
  }

  private async enrichPost(rawPost: any, viewerId?: number): Promise<Post> {
    if (!rawPost) {
      throw new Error('Post not found');
    }

    const [post] = await this.enrichPostsWithUsers([rawPost], viewerId);
    return post;
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

      const contentType = response.headers.get('content-type') ?? '';

      if (response.status === 204 || contentType.length === 0) {
        return undefined as T;
      }

      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      if (contentType.includes('text/')) {
        return (await response.text()) as unknown as T;
      }

      return (await response.blob()) as unknown as T;
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
    const payload = await this.request('/auth-service/api/auth/me');
    return this.normalizeUser(payload);
  }

  // User endpoints
  async getUser(id: string | number): Promise<User> {
    const payload = await this.request(`/user-service/api/users/${id}`);
    return this.normalizeUser(payload, Number(id));
  }

  async getUserBasic(id: string | number): Promise<User> {
    const payload = await this.request(`/user-service/api/users/${id}/basics`);
    return this.normalizeUser(payload, Number(id));
  }

  async updateUser(id: string | number, data: any): Promise<User> {
    const payload = await this.request(`/user-service/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.normalizeUser(payload, Number(id));
  }

  async followUser(userId: string | number, targetId: string | number): Promise<User> {
    await this.request(`/user-service/api/users/${targetId}/follow`, {
      method: 'POST',
      headers: {
        'X-User-Id': String(userId),
      },
    });
    return this.getUserBasic(targetId);
  }

  async unfollowUser(userId: string | number, targetId: string | number): Promise<User> {
    await this.request(`/user-service/api/users/${targetId}/unfollow`, {
      method: 'POST',
      headers: {
        'X-User-Id': String(userId),
      },
    });
    return this.getUserBasic(targetId);
  }

  async getFollowers(id: string | number): Promise<User[]> {
    const payload = await this.request(`/user-service/api/users/${id}/followers`);
    return Array.isArray(payload)
      ? payload.map((entry: any) => this.normalizeUser(entry))
      : [];
  }

  async getFollowing(id: string | number): Promise<User[]> {
    const payload = await this.request(`/user-service/api/users/${id}/following`);
    return Array.isArray(payload)
      ? payload.map((entry: any) => this.normalizeUser(entry))
      : [];
  }

  async isFollowing(userId: string | number, otherUserId: string | number): Promise<{ isFollowing: boolean }> {
    const payload = await this.request(`/user-service/api/users/${userId}/is-following/${otherUserId}`);
    if (typeof payload === 'boolean') {
      return { isFollowing: payload };
    }
    if (payload && typeof payload === 'object' && 'isFollowing' in payload) {
      return { isFollowing: Boolean((payload as any).isFollowing) };
    }
    return { isFollowing: false };
  }

  // Post endpoints
  async createPost(
    data: FormData | Record<string, unknown>,
    userId: number
  ): Promise<Post> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const payload = await this.request<any>('/post-service/api/post/create', {
      method: 'POST',
      body,
      headers: {
        'X-User-Id': String(userId),
      },
    });
    return this.enrichPost(payload, userId);
  }

  async getPost(id: string | number): Promise<Post> {
  const payload = await this.request<any>(`/post-service/api/posts/${id}`);
    return this.enrichPost(payload);
  }

  async deletePost(id: string | number, userId: string | number): Promise<void> {
    return this.request(`/post-service/api/post/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'X-User-Id': String(userId),
      },
    });
  }

  async getUserPosts(userId: string | number, viewerId?: number): Promise<Post[]> {
    const viewerQuery = viewerId != null ? `?viewerId=${viewerId}` : '';
  const payload = await this.request<any>(`/post-service/api/post/${userId}${viewerQuery}`);
    const postsArray = Array.isArray(payload) ? payload : [];
    return this.enrichPostsWithUsers(postsArray, viewerId);
  }

  async getFeed(userId: number): Promise<Post[]> {
  const payload = await this.request<any>(`/post-service/api/post/feed/${userId}`);
    const postsArray = Array.isArray(payload) ? payload : [];
    return this.enrichPostsWithUsers(postsArray, userId);
  }

  // Like endpoints
  async likePost(postId: string | number, userId: number) {
    return this.request(`/like-service/api/like/${postId}/user/${userId}`, {
      method: 'POST',
    });
  }

  async unlikePost(postId: string | number, userId: number) {
    return this.request(`/like-service/api/like/${postId}/user/${userId}/delete`, {
      method: 'DELETE',
    });
  }

  async getPostLikes(postId: string | number) {
    const payload = await this.request(`/like-service/api/like/${postId}`);
    if (typeof payload === 'number') {
      return payload;
    }
    if (payload && typeof payload === 'object') {
      if ('likeCount' in payload) {
        return this.toNumber((payload as any).likeCount) ?? 0;
      }
      if ('count' in payload) {
        return this.toNumber((payload as any).count) ?? 0;
      }
    }
    return 0;
  }

  async isPostLikedByUser(postId: string | number, userId: number): Promise<boolean> {
    const payload = await this.request(`/like-service/api/like/${postId}/user/${userId}`);
    if (typeof payload === 'boolean') {
      return payload;
    }
    if (payload && typeof payload === 'object') {
      if ('isLiked' in payload) {
        return Boolean((payload as any).isLiked);
      }
      if ('liked' in payload) {
        return Boolean((payload as any).liked);
      }
    }
    return false;
  }

  async getPostCommentCount(postId: string | number): Promise<number> {
    const payload = await this.request(`/comment-service/api/comment/${postId}/count`);
    if (typeof payload === 'number') {
      return payload;
    }
    if (payload && typeof payload === 'object') {
      if ('commentCount' in payload) {
        return this.toNumber((payload as any).commentCount) ?? 0;
      }
      if ('count' in payload) {
        return this.toNumber((payload as any).count) ?? 0;
      }
    }
    return 0;
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
  async requestChat(requesterId: number, otherUserId: number) {
    return this.request('/chat-service/api/chats/request', {
      method: 'POST',
      body: JSON.stringify({ otherUserId }),
      headers: {
        'X-User-Id': String(requesterId),
      },
    });
  }

  async acceptChatRequest(conversationId: string, accepterId: number) {
    return this.request(`/chat-service/api/chats/${conversationId}/accept`, {
      method: 'POST',
      headers: {
        'X-User-Id': String(accepterId),
      },
    });
  }

  async getConversations(userId: number): Promise<ChatConversation[]> {
    const conversations = await this.request<ChatConversation[]>('/chat-service/api/chats', {
      headers: {
        'X-User-Id': String(userId),
      },
    });
    
    // Enrich with user data
    if (Array.isArray(conversations)) {
      await Promise.all(
        conversations.map(async (conv) => {
          try {
            const userAData = await this.getUserBasic(conv.userA);
            const userBData = await this.getUserBasic(conv.userB);
            conv.participants = [userAData, userBData];
          } catch (error) {
            console.error('Failed to fetch participant data:', error);
            conv.participants = [];
          }
        })
      );
    }
    
    return conversations || [];
  }

  async getPendingChatRequests(userId: number): Promise<ChatConversation[]> {
    const requests = await this.request<ChatConversation[]>('/chat-service/api/chats/requests/pending', {
      headers: {
        'X-User-Id': String(userId),
      },
    });
    
    // Enrich with user data
    if (Array.isArray(requests)) {
      await Promise.all(
        requests.map(async (conv) => {
          try {
            const userAData = await this.getUserBasic(conv.userA);
            const userBData = await this.getUserBasic(conv.userB);
            conv.participants = [userAData, userBData];
          } catch (error) {
            console.error('Failed to fetch participant data:', error);
            conv.participants = [];
          }
        })
      );
    }
    
    return requests || [];
  }

  async sendMessage(senderId: number, conversationId: string, content: string) {
    return this.request('/chat-service/api/chats/message', {
      method: 'POST',
      body: JSON.stringify({ conversationId, content }),
      headers: {
        'X-User-Id': String(senderId),
      },
    });
  }

  async getMessages(conversationId: string, userId: number): Promise<ChatMessage[]> {
    const messages = await this.request<ChatMessage[]>(
      `/chat-service/api/chats/${conversationId}/messages`,
      {
        headers: {
          'X-User-Id': String(userId),
        },
      }
    );
    
    // Enrich with sender data
    if (Array.isArray(messages)) {
      await Promise.all(
        messages.map(async (msg) => {
          try {
            msg.sender = await this.getUserBasic(msg.senderId);
          } catch (error) {
            console.error('Failed to fetch sender data:', error);
          }
        })
      );
    }
    
    return messages || [];
  }
}

export const apiClient = new ApiClient();