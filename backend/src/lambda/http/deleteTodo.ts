import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { getUserId } from '../utils'

import { deleteTodo, getTodoById } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteTodo')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('delete todo handler', event)
  const todoId = event.pathParameters.todoId
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
      `User ${userId} does not have permission to delete todo ${todoId}`
    )
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'User does not have permission to delete this todo item'
      })
    }
  }
  await deleteTodo(todoId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}
