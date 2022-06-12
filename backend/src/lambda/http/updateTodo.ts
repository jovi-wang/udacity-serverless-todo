import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { updateTodo, getTodo } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'
const logger = createLogger('updateTodo')
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('update todo handler', event)
  const { todoId } = event.pathParameters
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  // const { name, dueDate, done } = updatedTodo

  // if (!name || !dueDate || typeof done != 'boolean') {
  //   logger.error('invalid request body', updatedTodo)
  //   return {
  //     statusCode: 400,
  //     headers: {
  //       'Access-Control-Allow-Origin': '*',
  //       'Access-Control-Allow-Credentials': true
  //     },
  //     body: JSON.stringify({
  //       error: 'request body is invalid!'
  //     })
  //   }
  // }

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

  await updateTodo(userId, todoId, updatedTodo)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}
