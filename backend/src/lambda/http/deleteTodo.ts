import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { getUserId } from '../utils'

import { deleteTodo, getTodo } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteTodo')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('delete todo handler', event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const todoItem = await getTodo(userId, todoId)

  if (!todoItem) {
    logger.error('No todo found with id', todoId)
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

  await deleteTodo(userId, todoId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}
