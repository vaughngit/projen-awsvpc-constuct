import * as path from 'path';
//import * as cdk from 'aws-cdk-lib';
//import { RemovalPolicy, Stack, StackProps, Tags, custom_resources as cr, CustomResource, CfnOutput, Duration, } from 'aws-cdk-lib';
import { Stack, Tags, custom_resources as cr, CustomResource, CfnOutput, Duration, RemovalPolicy, aws_ec2 as ec2, aws_logs as logs, aws_iam as iam } from 'aws-cdk-lib';
//import { aws_ec2 as ec2, aws_logs as logs, aws_iam as iam } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
//import {aws_ssm as ssm } from 'aws-cdk-lib'
import { Code, Function, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
//import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';


export interface IstackProps {
  environment: string;
  solutionName: string;
  costcenter: string;
  /**
   * vpc cidr
   * @default '172.16.0.0/16'
   */
  cidr?: string;

  /**vpc name
   * @default solutionName
  */
  name: string;
}


export class VTVpc extends Construct {

  /** API construct */
  public readonly vpc: ec2.Vpc;

  constructor(parent: Stack, id: string, props: IstackProps) {
    super(parent, id);

    const natGatewayProvider = ec2.NatProvider.instance({
      instanceType: new ec2.InstanceType('t3.nano'),
    });


    // Create new VPC
    const constructVpc = new ec2.Vpc(this, `${props.solutionName}-VPC`, {
      vpcName: props.solutionName,
      natGatewayProvider: natGatewayProvider,
      maxAzs: 3,
      //cidr: props.cidr,
      ipAddresses: props&& props.cidr ? ec2.IpAddresses.cidr(props.cidr) : ec2.IpAddresses.cidr('172.16.0.0/16'),
      natGateways: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: `${props.solutionName}-public-0`,
          cidrMask: 24,
          mapPublicIpOnLaunch: true,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: `${props.solutionName}-public-1`,
          cidrMask: 24,
          mapPublicIpOnLaunch: true,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: `${props.solutionName}-public-2`,
          cidrMask: 24,
          mapPublicIpOnLaunch: true,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: `${props.solutionName}-private-egress-0`,
          cidrMask: 24,
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          name: `${props.solutionName}-private-egress-2`,
          cidrMask: 24,
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          name: `${props.solutionName}-private-egress-3`,
          cidrMask: 24,
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          name: `${props.solutionName}-isolated-0`,
          cidrMask: 24,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        {
          name: `${props.solutionName}-isolated-1`,
          cidrMask: 24,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        {
          name: `${props.solutionName}-isolated-2`,
          cidrMask: 24,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
    /*
  // VPCID SSM Param
  new ssm.StringParameter(this, 'vpcid ssm param', {
    parameterName: `/${props.solutionName}/${props.environment}/vpcId`,
    stringValue: vpc.vpcId,
    description: `param for ${props.solutionName} vpcid`,
    type: ssm.ParameterType.STRING,
    tier: ssm.ParameterTier.INTELLIGENT_TIERING,
    allowedPattern: '.*',
  });
   */
    //EC2 Security Group
    const ec2SG = new ec2.SecurityGroup(this, 'EC2-SG', {
      vpc: constructVpc,
      description: `${props.solutionName} EC2 ${props.environment} SecurityGroup`,
      securityGroupName: `${props.solutionName}-EC2-${props.environment}-SG`,
    });
    ec2SG.addIngressRule(ec2SG, ec2.Port.allTraffic(), 'allow all east/west traffic inside security group');
    /*
    // createSsmParam.standardStringParameter(ecsSgSsmParam, ecsSG.securityGroupId);
    new ssm.StringParameter(this, 'ec2 sg ssm param', {
        parameterName: `/${props.solutionName}/${props.environment}/ec2SgId`,
        stringValue: ec2SG.securityGroupId,
        description: `param for ${props.solutionName} ec2 security group id`,
        type: ssm.ParameterType.STRING,
        tier: ssm.ParameterTier.INTELLIGENT_TIERING,
        allowedPattern: '.*',
    });
 */
    // S3 Gateway Endpoint
    constructVpc.addGatewayEndpoint('s3GatewayEndpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      // Add only to ISOLATED subnets
      subnets: [
        { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      ],
    });

    // DynamoDb Gateway endpoint
    constructVpc.addGatewayEndpoint('DynamoDbEndpoint', {
      service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
      // Add only to ISOLATED subnets
      subnets: [
        { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      ],
    });

    // Add an interface endpoint
    constructVpc.addInterfaceEndpoint('SystemsManagerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      // Uncomment the following to allow more fine-grained control over
      // who can access the endpoint via the '.connections' object.
      // open: false
      lookupSupportedAzs: true,
      open: true,
      securityGroups: [ec2SG],
    });


    // CloudWatch interface endpoint
    constructVpc.addInterfaceEndpoint('CloudWatchEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH,
      // Uncomment the following to allow more fine-grained control over
      // who can access the endpoint via the '.connections' object.
      // open: false
      lookupSupportedAzs: true,
      open: true,
      securityGroups: [ec2SG],
    });

    // CW Events interface endpoint
    constructVpc.addInterfaceEndpoint('CloudWatch_Events_Endpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_EVENTS,
      // Uncomment the following to allow more fine-grained control over
      // who can access the endpoint via the '.connections' object.
      // open: false
      lookupSupportedAzs: true,
      open: true,
      securityGroups: [ec2SG],
    });

    // CW Logs interface endpoint
    constructVpc.addInterfaceEndpoint('CloudWatch_Logs_Endpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      // Uncomment the following to allow more fine-grained control over
      // who can access the endpoint via the '.connections' object.
      // open: false
      lookupSupportedAzs: true,
      open: true,
      securityGroups: [ec2SG],
    });

    // ECR interface endpoint
    constructVpc.addInterfaceEndpoint('EcrDockerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
      // Uncomment the following to allow more fine-grained control over
      // who can access the endpoint via the '.connections' object.
      // open: false
      securityGroups: [ec2SG],
      lookupSupportedAzs: true,
      open: true,
    });

    // EFS interface endpoint
    constructVpc.addInterfaceEndpoint('EFSEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ELASTIC_FILESYSTEM,
      // Uncomment the following to allow more fine-grained control over
      // who can access the endpoint via the '.connections' object.
      // open: false
      lookupSupportedAzs: true,
      open: true,
    });
    /*
    new ec2.InterfaceVpcEndpoint(this, "efs endpoint", {
      vpc,
      service: new ec2.InterfaceVpcEndpointService(`com.amazonaws.${this.region}.elasticfilesystem`, 2049),
      securityGroups: [ecsSG],
      open: true ,
      lookupSupportedAzs: true
    })
*/

    // Configure Cloudwatch Log group:
    const logGroup = new logs.LogGroup(
      this, 'create solution Log group',
      {
        logGroupName: `/${props.solutionName}/${props.environment}/`,
        removalPolicy: RemovalPolicy.DESTROY,
        retention: logs.RetentionDays.ONE_MONTH,
      },
    );

    /*
  //CW Log group SSM Param
  new ssm.StringParameter(this, 'log group name ssm param', {
    parameterName: `/${props.solutionName}/${props.environment}/logGroupName`,
    stringValue: logGroup.logGroupName,
    description: `param for ${props.solutionName} log group name`,
    type: ssm.ParameterType.STRING,
    tier: ssm.ParameterTier.INTELLIGENT_TIERING,
    allowedPattern: '.*',
  });
   */

    /*
  const vpcFlowlogsRole = new iam.Role(this, `${props.solutionName}-role-for-vpcflowlogs`, {
    assumedBy: new iam.ServicePrincipal('vpc-flow-logs.amazonaws.com')
  });

  new ec2.FlowLog(this, 'FlowLog', {
    flowLogName: `${props.solutionName}-${props.environment}-vpclogs`,
    resourceType: ec2.FlowLogResourceType.fromVpc(vpc),
    trafficType: ec2.FlowLogTrafficType.ALL,
    destination: ec2.FlowLogDestination.toCloudWatchLogs(logGroup, vpcFlowlogsRole)
  }); */

    this.vpc = constructVpc;

    const sdk3layer = new lambda.LayerVersion(this, 'HelperLayer', {
      code: lambda.Code.fromAsset('assets/lambda-layers/aws-sdk-3-layer'),
      description: 'AWS JS SDK v3',
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X, lambda.Runtime.NODEJS_16_X],
      removalPolicy: RemovalPolicy.DESTROY,
    });

    /*
    const crLambda = new NodejsFunction(this, 'customResourceFunction', {
      functionName: `${props.solutionName}-update-infrastructure-${props.environment}`,
      entry: path.join(__dirname, '/../../assets/customResourceLambda/index.ts'),
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler',
      timeout: Duration.minutes(10),
      layers: [sdk3layer],
      environment: {
        REGION: parent.region,
      },
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', '@aws-sdk/client-iam', '@aws-sdk/client-ec2'],
      },
    });

     */

    const crLambda = new Function(this, 'customResourceFunction', {
      functionName: `${props.solutionName}-update-infrastructure-${props.environment}`,
      description: 'customer resource function to tag vpc interfaces and delete natgateway on destroy',
      //entry: path.join(__dirname, '/../../assets/customResourceLambda/index.ts'),
      code: Code.fromAsset(path.join(__dirname, '/../../lib/assets/customResourceLambda')),
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      timeout: Duration.minutes(10),
      layers: [sdk3layer],
      tracing: Tracing.ACTIVE,
      environment: {
        REGION: parent.region,
      },
      // bundling: {
      //   minify: true,
      //   externalModules: ['aws-sdk', '@aws-sdk/client-iam', '@aws-sdk/client-ec2'],
      // },
    });

    const provider = new cr.Provider(this, 'Provider', {
      onEventHandler: crLambda,
    });

    provider.onEventHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['iam:*', 'ec2:*'],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      }),
    );

    // Custom resource to add tag to interface gateways and manage nat gateway:
    new CustomResource(this, 'CustomResource', {
      serviceToken: provider.serviceToken,
      properties: {
        natGateways: natGatewayProvider.configuredGateways,
        vpcId: constructVpc.vpcId,
        tags: [{ Key: 'environment', Value: props.environment }, { Key: 'solution', Value: props.solutionName }, { Key: 'costcenter', Value: props.costcenter }],

      },
    });

    // Tags.of(this).add("service", `${props.serviceName}`,{
    //   includeResourceTypes: []
    // })
    Tags.of(this).add('environment', props.environment);
    Tags.of(this).add('solution', props.solutionName);
    Tags.of(this).add('costcenter', props.costcenter);
    //Tags.of(this).add("ShutdownPolicy", "NoShutdown")


    new CfnOutput(this, 'VPCId', { value: constructVpc.vpcId, exportName: `${props.solutionName}:${props.environment}:VPCID:${parent.region}` } );

    //new CfnOutput(this, 'NatGateways', { value: natGatewayProvider.configuredGateways.toString()} );

    new CfnOutput(this, 'VPCCIDR', { value: constructVpc.vpcCidrBlock, exportName: `${props.solutionName}:VpcCIDR` } );

    new CfnOutput(this, 'VPCPrivateSubnet0', { value: constructVpc.privateSubnets[0].subnetId, exportName: `${props.solutionName}:PrivateSubnet0` } );

    new CfnOutput(this, 'VPCPrivateSubnet1', { value: constructVpc.privateSubnets[1].subnetId, exportName: `${props.solutionName}:PrivateSubnet1` } );

    new CfnOutput(this, 'VPCPrivateSubnet2', { value: constructVpc.privateSubnets[2].subnetId, exportName: `${props.solutionName}:PrivateSubnet2` } );

    new CfnOutput(this, 'VPCPrivateSubnet0-AZ', { value: constructVpc.privateSubnets[0].availabilityZone } );

    new CfnOutput(this, 'VPCPrivateSubnet1-AZ', { value: constructVpc.privateSubnets[1].availabilityZone });

    new CfnOutput(this, 'EC2SecurityGroup', { value: ec2SG.securityGroupId, exportName: `${props.solutionName}:EC2SecurityGroup` } );

    new CfnOutput(this, 'LogGroupName', { value: logGroup.logGroupName });


  }
}