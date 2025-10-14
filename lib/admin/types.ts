export interface AdminStats {
  totalUsers: number;
  adminUsers: number;
  editorUsers: number;
  regularUsers: number;
  blogStats: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalCategories: number;
    totalAuthors: number;
    totalViews: number;
  };
}

export interface UserRole {
  id: string;
  role: 'user' | 'admin' | 'editor';
}
