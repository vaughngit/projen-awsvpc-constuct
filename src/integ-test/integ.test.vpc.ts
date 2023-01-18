//import path from 'path';
//import { RemovalPolicy, Stack, Tags, CfnOutput, Fn } from 'aws-cdk-lib';
import { App, Stack, Tags } from 'aws-cdk-lib';
import { VTVpc } from '../vpc';


// import * as iam from 'aws-cdk-lib/aws-iam';


const aws_region = 'us-east-2';
const solution = 'VPCConstructIntegTest';
const environment = 'dev';
const costcenter = 'tnc';

export class IntegTesting {


  //public readonly cognitoidentityPoolId : CfnOutput;
  //public readonly vpc!: CfnOutput;

  readonly stack: Stack[];
  constructor() {

    const env = {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: aws_region || process.env.CDK_DEFAULT_REGION,
    };


    const app = new App();

    const stack = new Stack(app, 'VPCIntegrationTestStack', {
      env,
      tags: {
        solution,
        environment,
        costcenter,
      },
    });


    new VTVpc(stack, 'VTVpcConstruct', {
      solutionName: 'UnitestVPC',
      costcenter: 'tnc',
      environment: 'test',
      name: 'testvpc',
      // cidr: '172.16.0.0/16',
    });


    this.stack = [stack];


    Tags.of(stack).add('solution', solution);
    Tags.of(stack).add('environment', environment);
    Tags.of(stack).add('costcenter', costcenter);

  }
}

new IntegTesting();