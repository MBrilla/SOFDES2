export interface Category {
  id: string
  name: string
  user_id: string
  created_at: string
}

export interface Todo {
  id: string
  title: string
  completed: boolean
  category_id: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  content: string
  todo_id: string
  user_id: string
  created_at: string
} 