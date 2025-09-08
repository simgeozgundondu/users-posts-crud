export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body?: string;
}

export interface CreateUserData {
  name: string;
  username: string;
  email: string;
}

export interface CreatePostData {
  userId: number;
  title: string;
  body?: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: number;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: number;
}
