import AWS from 'aws-sdk'

import config from '../../appconfig'
import logger from '../../logger'

export async function sendSmsWithAWS(phone: string, text: string): Promise<void> {
  const params = {
    Message: text,
    PhoneNumber: `1${phone}`
  }

  // Create promise and SNS service object
  const publishTextPromise = new AWS.SNS({
    apiVersion: '2010-03-31',
    ...config.aws.sms
  })
    .publish(params)
    .promise()

  return await publishTextPromise
    .then((data: any) => {
      logger.info(`MessageID is ${data.MessageId as string}`)
    })
    .catch((err: any) => {
      logger.error(err)
    })
}
