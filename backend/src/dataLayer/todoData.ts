import 'source-map-support/register'
import * as AWS from 'aws-sdk'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const dynamoDocument = new XAWS.DynamoDB.DocumentClient()

const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const logger = createLogger('todoDataLayer')

export class TodoData {
  constructor(
    private readonly docClient: DocumentClient = dynamoDocument,
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosTableUserIndex = process.env.TODOS_TABLE_INDEX_NAME,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET
  ) {}

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Query all todos for user ${userId}`)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosTableUserIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    return result.Items as TodoItem[]
  }

  async createTodoItem(todoItem: TodoItem): Promise<void> {
    logger.info(`Put new todo ${todoItem.todoId} with param: `, todoItem)
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise()
  }

  async updateTodoItem(todoId: string, todoUpdate: TodoUpdate): Promise<void> {
    logger.info(`Update todo item ${todoId} with param: `, todoUpdate)

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':dueDate': todoUpdate.dueDate,
          ':done': todoUpdate.done
        }
      })
      .promise()
  }

  async deleteTodoItem(todoId: string): Promise<void> {
    logger.info(`Delete todo item ${todoId}`)
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId: todoId
        }
      })
      .promise()
  }

  async getTodoById(todoId: string): Promise<TodoItem> {
    logger.info(`Get todo by id: ${todoId}`)

    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          todoId
        }
      })
      .promise()

    const item = result.Item
    return item as TodoItem
  }
  async generateUploadUrl(todoId: string): Promise<String> {
    const url = getUploadUrl(todoId, this.bucketName)

    const attachmentUrl: string =
      'https://' + this.bucketName + '.s3.amazonaws.com/' + todoId

    const options = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId
      },
      UpdateExpression: 'set attachmentUrl = :url',
      ExpressionAttributeValues: {
        ':url': attachmentUrl
      }
    }

    await this.docClient.update(options).promise()

    return url
  }
}

const getUploadUrl = (todoId: string, bucketName: string): string => {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: parseInt(urlExpiration)
  })
}
