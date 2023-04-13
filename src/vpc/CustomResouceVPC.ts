import * as fs from 'fs';
import * as path from 'path';
import { Arn, CustomResource, Stack } from 'aws-cdk-lib';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { IRole, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { CalendarSetupFunction } from './calendar-setup-function';


/**
 * Options for defining a CustomResourceCalendar
 */
interface CustomResourceCalendarOptions extends CalendarLocationOptionsBase {
    /**
     * The type of calendar source.
     */
    readonly sourceType: CalendarSourceType;
  
    /**
     * The contents of the calendar.
     *
     * @default - None. If this is empty, the calendar is being fetched from S3.
     */
    readonly calendarBody?: string;
  
    /**
     * The S3 bucket where the calendar file is stored.
     *
     * @default - None. If this is empty, the calendar is being fetched from a local file path.
     */
    readonly bucketName?: string;
  
    /**
     * The role used for getting the calendar file.
     *
     * @default - None. If this is empty, the calendar is either being fetched from a local file path or the S3 session
     * will be created with the credentials already in use.
     */
    readonly roleArn?: string;
  }
  
  /**
   * The custom resource for getting the calendar and uploading it to SSM.
   */
  class CustomResourceCalendar extends Calendar {
    constructor(scope: Construct, options: CustomResourceCalendarOptions) {
      super();
  
      this.calendarName = options.calendarName;
      this.calendarArn = Arn.format({
        service: 'ssm',
        resource: 'document',
        resourceName: options.calendarName,
      }, Stack.of(scope));
  
      const onEvent: Function = new CalendarSetupFunction(scope, 'OnEventHandler');
  
      /**
       * Code for addToRolePolicy goes here
       */
  
      const provider = new Provider(scope, 'Provider', {
        onEventHandler: onEvent,
      });
  
      new CustomResource(scope, 'SSMCalendarCustomResource', {
        serviceToken: provider.serviceToken,
        properties: {
          sourceType: options.sourceType,
          calendarBody: options.calendarBody,
          bucketName: options.bucketName,
          calendarName: options.calendarName,
          roleArn: options.roleArn,
        },
      });
    }
  
    public _bind() {}
  }
  

