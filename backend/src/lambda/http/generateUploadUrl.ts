import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { generateUploadUrl, getTodoById } from '../../businessLogic/todo'

const logger = createLogger('generateUploadUrl')
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('generate signed url handler', event)

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  //check if todo item exists
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

  let url = await generateUploadUrl(todoId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}
