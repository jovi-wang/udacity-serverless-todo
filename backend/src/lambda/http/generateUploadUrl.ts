import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { generateUploadUrl, getTodo } from '../../businessLogic/todo'

const logger = createLogger('generateUploadUrl')
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('generate signed url handler', event)

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  //check if todo item exists
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

  let url = await generateUploadUrl(userId, todoId)
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
