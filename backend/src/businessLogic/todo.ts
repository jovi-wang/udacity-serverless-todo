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

export const getTodo = async (
  userId: string,
  todoId: string
): Promise<TodoItem> => {
  return await todoData.getTodo(userId, todoId)
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
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> => {
  await todoData.updateTodoItem(userId, todoId, updateTodoRequest as TodoUpdate)
}

export const deleteTodo = async (
  userId: string,
  todoId: string
): Promise<void> => {
  await todoData.deleteTodoItem(userId, todoId)
}

export const generateUploadUrl = (
  userId: string,
  todoId: string
): Promise<String> => {
  return todoData.generateUploadUrl(userId, todoId)
}
