import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { updateTodo, getTodoById } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'
const logger = createLogger('updateTodo')
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('update todo handler', event)
  const { todoId } = event.pathParameters
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  const todoItem = await getTodoById(todoId)

  if (!todoItem) {
    logger.error('No todo found with id ', todoId)
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Todo item does not exist, please provide a valid todoId'
      })
    }
  }

  if (todoItem.userId !== userId) {
    logger.error(
      `User ${userId} does not have permission to update todo ${todoId}`
    )
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'User does not have permission to update this todo item'
      })
    }
  }
  await updateTodo(todoId, updatedTodo)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}
