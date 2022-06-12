import 'source-map-support/register'
import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoData } from '../dataLayer/todoData'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoData = new TodoData()

export const getTodos = async (userId: string): Promise<TodoItem[]> => {
  return await todoData.getTodos(userId)
}

export const getTodoById = async (todoId: string): Promise<TodoItem> => {
  return await todoData.getTodoById(todoId)
}

export const createTodo = async (
  createTodoParam: CreateTodoRequest,
  userId: string
): Promise<TodoItem> => {
  const todoId = uuid.v4()

  const newTodoItem: TodoItem = {
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    done: false,
    ...createTodoParam
  }

  await todoData.createTodoItem(newTodoItem)

  return newTodoItem
}

export const updateTodo = async (
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> => {
  await todoData.updateTodoItem(todoId, updateTodoRequest as TodoUpdate)
}

export const deleteTodo = async (todoId: string): Promise<void> => {
  await todoData.deleteTodoItem(todoId)
}

export const generateUploadUrl = (todoId: string): Promise<String> => {
  return todoData.generateUploadUrl(todoId)
}
