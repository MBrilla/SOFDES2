import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Dayjs } from 'dayjs'
import { message } from 'antd'
import dayjs from 'dayjs'
import { supabase } from '../supabaseClient'

export interface Comment {
  id: string
  text: string
  author: string
  timestamp: Date
}

export interface Activity {
  id: string
  type: 'status_change' | 'priority_change' | 'category_change' | 'assignment_change'
  description: string
  timestamp: Date
  user: string
}

export interface Todo {
  id: string
  text: string
  completed: boolean
  startDate?: Dayjs
  dueDate?: Dayjs
  category?: string
  priority?: 'low' | 'medium' | 'high'
  color?: string
  status?: 'todo' | 'in-progress' | 'completed'
  assignedTo?: string
  user_id?: string
  comments: Comment[]
  activities: Activity[]
}

interface Category {
  id: string
  name: string
  user_id: string
  created_at: string
}

interface CommentType {
  id: string
  task_id: string
  user_id: string
  text: string
  created_at: string
}

interface TodoContextType {
  todos: Todo[]
  categories: Category[]
  comments: CommentType[]
  fetchCategories: () => Promise<void>
  addCategory: (name: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  fetchComments: (taskId: string) => Promise<void>
  addComment: (taskId: string, text: string) => Promise<void>
  deleteComment: (id: string) => Promise<void>
  addTodo: (text: string, category?: string, startDate?: Dayjs, dueDate?: Dayjs, priority?: 'low' | 'medium' | 'high', color?: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>
  fetchTodos: () => Promise<void>
  importData: (data: string) => void
  clearData: () => void
  assignTodo: (todoId: string, assignee: string) => void
  getFilteredTodos: (filters: {
    dateRange: [Date, Date] | null
    categories: string[]
    priorities: string[]
  }) => Todo[]
  updateCategoryName: (id: string, newName: string) => Promise<void>
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

const DEFAULT_CATEGORIES = [
  { name: 'Work' },
  { name: 'Personal' },
  { name: 'Shopping' },
  { name: 'Health' },
  { name: 'Other' }
]


export function useTodo() {
  const ctx = useContext(TodoContext)
  if (!ctx) throw new Error('useTodo must be used within a TodoProvider')
  return ctx
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [comments, setComments] = useState<CommentType[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  // Listen for auth changes and update userId
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
    return () => { listener?.subscription.unsubscribe() }
  }, [])

  // Fetch todos and categories when userId changes
  useEffect(() => {
    if (userId) {
      fetchTodos(userId)
      fetchCategories(userId).then((fetched) => {
        if (fetched && fetched.length === 0) {
          // Insert default categories for new user
          Promise.all(
            DEFAULT_CATEGORIES.map(cat =>
              supabase.from('categories').insert([{ user_id: userId, name: cat.name }])
            )
          ).then(() => fetchCategories(userId))
        }
      })
    } else {
      setTodos([])
      setCategories([])
    }
  }, [userId])

  // Fetch tasks for the logged-in user
  const fetchTodos = async (uid?: string) => {
    const id = uid || userId
    if (!id) {
      setTodos([])
      return
    }
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
    if (error) {
      message.error('Failed to fetch tasks')
      setTodos([])
      return
    }
    setTodos(
      (data || []).map(todo => ({
        ...todo,
        startDate: todo.start_date ? dayjs(todo.start_date) : undefined,
        dueDate: todo.due_date ? dayjs(todo.due_date) : undefined,
      }))
    )
  }

  // Categories CRUD
  const fetchCategories = async (uid?: string): Promise<Category[]> => {
    const id = uid || userId
    if (!id) {
      setCategories([])
      return []
    }
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: true })
    if (error) {
      message.error('Failed to fetch categories')
      setCategories([])
      return []
    }
    setCategories(data || [])
    return data || []
  }

  // Expose a void-returning fetchCategories for the context
  const fetchCategoriesVoid = async () => { await fetchCategories() }

  const addCategory = async (name: string) => {
    if (!userId) return
    const { error } = await supabase.from('categories').insert([{ user_id: userId, name }])
    if (error) {
      message.error('Failed to add category')
      return
    }
    fetchCategories()
    message.success('Category added')
  }

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      message.error('Failed to delete category')
      return
    }
    fetchCategories()
    message.success('Category deleted')
  }

  const updateCategoryName = async (id: string, newName: string) => {
    if (!userId) return
    const { error } = await supabase
      .from('categories')
      .update({ name: newName })
      .eq('id', id)
      .eq('user_id', userId)
    if (error) {
      message.error('Failed to update category name')
      return
    }
    await fetchCategories()
  }

  // Comments CRUD
  const fetchComments = async (taskId: string) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    if (error) {
      message.error('Failed to fetch comments')
      setComments([])
      return
    }
    setComments(data || [])
  }

  const addComment = async (taskId: string, text: string) => {
    if (!userId) return
    const { error } = await supabase.from('comments').insert([{ task_id: taskId, user_id: userId, text }])
    if (error) {
      message.error('Failed to add comment')
      return
    }
    fetchComments(taskId)
    message.success('Comment added')
  }

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) {
      message.error('Failed to delete comment')
      return
    }
    message.success('Comment deleted')
  }

  const addTodo: TodoContextType['addTodo'] = async (text, category, startDate, dueDate, priority, color) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        user_id: user.id,
        text,
        completed: false,
        category,
        start_date: startDate ? startDate.format('YYYY-MM-DD') : null,
        due_date: dueDate ? dueDate.format('YYYY-MM-DD') : null,
        priority,
        color,
        status: 'todo',
      }])
      .select()
      .single()
    if (error) {
      message.error('Failed to add todo')
      return
    }
    setTodos(prev => [{
      ...data,
      startDate: data.start_date ? dayjs(data.start_date) : undefined,
      dueDate: data.due_date ? dayjs(data.due_date) : undefined,
    }, ...prev])
    message.success('Todo added')
  }

  const deleteTodo: TodoContextType['deleteTodo'] = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      message.error('Failed to delete todo')
      return
    }
    setTodos(prev => prev.filter(todo => todo.id !== id))
    message.success('Todo deleted')
  }

  const toggleTodo: TodoContextType['toggleTodo'] = async (id) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !todo.completed })
      .eq('id', id)
    if (error) {
      message.error('Failed to update todo')
      return
    }
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const updateTodo: TodoContextType['updateTodo'] = async (id, updates) => {
    const dbUpdates: any = { ...updates }
    if (updates.startDate) dbUpdates.start_date = updates.startDate.format('YYYY-MM-DD')
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate.format('YYYY-MM-DD')
    delete dbUpdates.startDate
    delete dbUpdates.dueDate
    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
    if (error) {
      message.error('Failed to update todo')
      return
    }
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const assignTodo = (todoId: string, assignee: string) => {
    setTodos(
      todos.map(todo => {
        if (todo.id === todoId) {
          const oldAssignee = todo.assignedTo
          const newTodo = { ...todo, assignedTo: assignee }
          if (oldAssignee !== assignee) {
            newTodo.activities.push({
              id: Date.now().toString(),
              type: 'assignment_change',
              description: `Assigned from ${oldAssignee || 'unassigned'} to ${assignee}`,
              timestamp: new Date(),
              user: 'System'
            })
          }
          return newTodo
        }
        return todo
      })
    )
  }

  const getFilteredTodos = (filters: {
    dateRange: [Date, Date] | null
    categories: string[]
    priorities: string[]
  }) => {
    return todos.filter(todo => {
      const matchesDateRange = !filters.dateRange || (
        todo.dueDate?.isAfter(dayjs(filters.dateRange[0])) &&
        todo.dueDate?.isBefore(dayjs(filters.dateRange[1]))
      )
      const matchesCategories = filters.categories.length === 0 || 
        (todo.category && filters.categories.includes(todo.category))
      const matchesPriorities = filters.priorities.length === 0 ||
        (todo.priority && filters.priorities.includes(todo.priority))
      
      return matchesDateRange && matchesCategories && matchesPriorities
    })
  }

  const importData = (data: string) => {
    try {
      const { todos: importedTodos, categories: importedCategories } = JSON.parse(data)
      // Convert date strings back to dayjs objects and ensure arrays exist
      const processedTodos = importedTodos.map((todo: any) => ({
        ...todo,
        startDate: todo.startDate ? dayjs(todo.startDate) : undefined,
        dueDate: todo.dueDate ? dayjs(todo.dueDate) : undefined,
        activities: (todo.activities || []).map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        })),
        comments: (todo.comments || []).map((comment: any) => ({
          ...comment,
          timestamp: new Date(comment.timestamp)
        }))
      }))
      setTodos(processedTodos)
      setCategories(importedCategories)
      message.success('Data imported successfully')
    } catch (error) {
      message.error('Failed to import data')
    }
  }

  const clearData = () => {
    setTodos([])
    setCategories([])
    message.success('All data cleared')
  }

  return (
    <TodoContext.Provider value={{
      todos,
      categories,
      comments,
      fetchCategories: fetchCategoriesVoid,
      addCategory,
      deleteCategory,
      updateCategoryName,
      fetchComments,
      addComment,
      deleteComment,
      addTodo,
      deleteTodo,
      toggleTodo,
      updateTodo,
      fetchTodos,
      importData,
      clearData,
      assignTodo,
      getFilteredTodos
    }}>
      {children}
    </TodoContext.Provider>
  )
} 