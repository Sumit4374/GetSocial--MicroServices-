export interface User {
  id: number;  // Changed from string to number to match backend Long
  username: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  // Note: These fields are not returned by auth service /me endpoint
  // They would need to come from user service if needed
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  createdAt?: string;
}

export interface Post {
  id: number;
  userId: number;  // Changed to match User.id type
  content?: string;
  caption?: string;
  imageUrl?: string;
  mediaUrl?: string;
  createdAt?: string | null;
  likeCount?: number;
  commentCount?: number;
  user?: User;
  isLiked?: boolean;
}

export interface Comment {
  id: string | number;
  postId: string | number;
  userId: number;  // Changed to match User.id type
  content?: string;
  comment?: string;
  createdAt?: string | null;
  user?: User;
}

export interface Like {
  id: string;
  postId: string;
  userId: number;  // Changed to match User.id type
  user: User;
}

export interface ChatConversation {
  id: string;
  userA: number;
  userB: number;
  status: 'REQUESTED' | 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  participants?: User[];
  lastMessage?: ChatMessage;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: number;  // Changed to match User.id type
  content: string;
  createdAt: string;
  sender: User;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'chat_request' | 'post';
  userId: number;  // Changed to match User.id type
  fromUser: User;
  postId?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}