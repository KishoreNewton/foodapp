import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { MailModuleOptions } from './mail.interfaces';
import * as AWS from 'aws-sdk';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
  ) {
    // this.sendEmail('kishor', 'kish');
  }

  private async sendEmail(recipientEmail: string, data: string) {
    AWS.config.update({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_KEY_ID,
      secretAccessKey: process.env.AWS_ACCESS_KEY
    });
    AWS.config.getCredentials(function (err) {
      if (err) {
        console.log(err.stack);
      } else {
        console.log('Access key:', AWS.config.credentials.accessKeyId);
      }
    });

    let params = {
      Destination: {
        /* required */
        CcAddresses: [
          /* more items */
        ],
        ToAddresses: [
          recipientEmail
          /* more items */
        ]
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: data
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Hey there from foodapp confirm your mail address'
        }
      },
      Source: process.env.AWS_SOURCE,
      ReplyToAddresses: [
        process.env.AWS_SOURCE
      ]
    };

    let sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
      .sendEmail(params)
      .promise();

    // Handle promise's fulfilled/rejected states
    sendPromise
      .then(function (data) {
        console.log(data.MessageId);
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail(email, `Hey ${email} here is the verification code 🔓 ${code} 🔓  Copy and paste this code to verify account`)
  }

}
