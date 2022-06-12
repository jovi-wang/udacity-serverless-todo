import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'
const logger = createLogger('createTodo')
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('create todo handler', event)

  const userId = getUserId(event)
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const { name, dueDate } = newTodo
  if (!name || !dueDate) {
    logger.error('invalid request body', newTodo)
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'request body is invalid!'
      })
    }
  }

  const todoItem = await createTodo(newTodo, userId)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ item: todoItem })
  }
}
