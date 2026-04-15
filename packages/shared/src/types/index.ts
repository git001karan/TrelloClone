// ─────────────────────────────────────────────────────
// API RESPONSE WRAPPER
// ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────────────
// AUTH DTOs
// ─────────────────────────────────────────────────────

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
}

// ─────────────────────────────────────────────────────
// BOARD DTOs
// ─────────────────────────────────────────────────────

export interface CreateBoardDto {
  title: string;
  description?: string;
  background?: string;
}

export interface UpdateBoardDto {
  title?: string;
  description?: string;
  background?: string;
  isClosed?: boolean;
}

// ─────────────────────────────────────────────────────
// LIST DTOs
// ─────────────────────────────────────────────────────

export interface CreateListDto {
  title: string;
  boardId: string;
}

export interface UpdateListDto {
  title?: string;
}

export interface MoveListDto {
  boardId: string;
  newPosition: number;
}

// ─────────────────────────────────────────────────────
// CARD DTOs
// ─────────────────────────────────────────────────────

export interface CreateCardDto {
  title: string;
  listId: string;
  description?: string;
}

export interface UpdateCardDto {
  title?: string;
  description?: string;
  dueDate?: string | null;
}

export interface MoveCardDto {
  targetListId: string;
  newPosition: number;
}

// ─────────────────────────────────────────────────────
// LABEL DTOs
// ─────────────────────────────────────────────────────

export interface CreateLabelDto {
  name: string;
  color: string;
  boardId: string;
}

export interface UpdateLabelDto {
  name?: string;
  color?: string;
}
