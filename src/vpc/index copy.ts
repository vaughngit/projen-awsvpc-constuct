import * as path from 'path';
//import * as cdk from 'aws-cdk-lib';
//import { RemovalPolicy, Stack, StackProps, Tags, custom_resources as cr, CustomResource, CfnOutput, Duration, } from 'aws-cdk-lib';
import { Stack, Tags, custom_resources as cr, CustomResource, CfnOutput, Duration, RemovalPolicy, aws_ec2 as ec2, aws_logs as logs, aws_iam as iam, Arn } from 'aws-cdk-lib';
//import { aws_ec2 as ec2, aws_logs as logs, aws_iam as iam } from 'aws-cdk-lib';
//import * as lambda from 'aws-cdk-lib/aws-lambda';
//import {aws_ssm as ssm } from 'aws-cdk-lib'
import { Code, Function, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
//import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { VpcResourceTaggingFunction } from './vpc-resource-tagging-function';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';



    /**
     * Options for creating a VPC object.
     */
    export interface VpcOptionsBase {
        /**
       * The name of the vpc.
       * @default solutionName
       */
        readonly vpcName: string;
        /**
        * What environment are you deploying vpc into.
        */
        environment: "dev" | "test" | "stage" | "prod"
        /**
        * Provide name to overall solution.
        */
        solutionName: string;
        /**
        * Provide responsible entity 
        */
        costcenter: string;
        /**
         * vpc cidr
         * @default '172.16.0.0/16'
         */
        cidr?: string;

        ngwycount: number; 

    }

    /**
    * Options for creating an AWS Managed NATGateway 
    */
    export interface ManagedNatGatewayVpcOptions extends VpcOptionsBase{
      /**
       * The number of NAT Gateways/Instances to create.
       *
       */
      //count?: number; 
    }

    /**
    * Options for creating a NATGateway using EC2 Instances
    */
    export interface Ec2NatGatewayVpcOptions extends VpcOptionsBase{
      /**
       * Instance Type for Managed NatGateway
       * @default t3.nano
       */
      instanceType: string; 
        /**
       * The number of NAT Gateways/Instances to create.
       *
       */
       // count?: number; 
    }


    /**
     * The source types for the NAT Gateway services.
     */
    export enum NatGatewayType {
      /**
       * AWS Managed NAT Gateway
       */
      MANAGED = 'managed',

      /**
       * EC2 Instance NAT Gateway
       */
      INSTANCE = 'instance',
    };

    /**
     * The calendar for determining if pipeline stage should be open or closed.
     */
    export abstract class VpcClass {

          /**
         * Creates a calendar from an S3 bucket.
         */
          public static managed(options: ManagedNatGatewayVpcOptions): VpcClass {
            return new class extends VpcClass {
              public _bind(scope: Construct): VpcClass {

                const constructVpc = new CustomResourceVpc(scope, {
                  costcenter: options.costcenter,
                  environment: options.environment,
                  solutionName: options.solutionName,
                  ngwycount: options.ngwycount, 
                  vpcName: options.vpcName,
                  natGatewayType: NatGatewayType.MANAGED,

                });
        
                  //Typically, for resources created in classes, adding a way to access that resource’s name and ARN is a best practice
                  this.vpcArn = constructVpc.vpcArn
                  this.vpcName = constructVpc.vpcName
                  this.vpcId = constructVpc.vpcId
                  this.vpc = constructVpc.vpc
        
                return constructVpc;
              }
            };
          }

        /**
        * The VPC object.
        */
        public vpc!: IVpc;
        
        /**
        * The name of the vpc
        */
        public vpcName!: string;

        /**
         * The ARN of the vpc
         */
        public vpcArn!: string;

      
        /**
         * The vpcid
         */
        public vpcId!: string;


        protected constructor() {}
      
        /**
         *
         * @internal
         */
        public abstract _bind(scope: Construct): any;

          // Vpc class end
    }

  /**
   * Options for defining a CustomResourceVpc
   */
  interface CustomResourceVpcOptions extends VpcOptionsBase {

    /**
     * The type of NAT Gateway.
     *
    */
    readonly natGatewayType: NatGatewayType
    

    /**
     * The role used for getting the
     *
     * @default - None. If this is empty, the resources will be created with the credentials already in use.
     */
    readonly roleArn?: string;
    /**
    * VPC ID.
    */
    readonly vpcId: string;
    /**
    * VPC Ref.
    */
    readonly vpc: IVpc;
  }


  /**
   * The custom resource for getting the calendar and uploading it to SSM.
   */
  class CustomResourceVpc extends VpcClass {
    constructor(scope: Construct, options: CustomResourceVpcOptions) {
      super();


      this.vpcName = options.vpcName;

      this.vpcArn = Arn.format({
        service: 'ec2',
        resource: 'vpc',
        resourceName: options.vpcName,
      }, Stack.of(scope));
  

      const onEvent: Function = new VpcResourceTaggingFunction(scope, 'OnEventHandler');

      // onEvent.addToRolePolicy(new PolicyStatement({
      //   actions: ['ssm:CreateDocument', 'ssm:UpdateDocument', 'ssm:DeleteDocument'],
      //   resources: [this.calendarArn],
      // }));

      
      onEvent.addToRolePolicy(new PolicyStatement({
        actions: ['iam:*', 'ec2:*'],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      }));

      
      const provider = new cr.Provider(scope, 'Provider', {
        //onEventHandler: crLambda,
        onEventHandler: onEvent,
      });
  
      // provider.onEventHandler.addToRolePolicy(
      //   new iam.PolicyStatement({
      //     actions: ['iam:*', 'ec2:*'],
      //     effect: iam.Effect.ALLOW,
      //     resources: ['*'],
      //   }),
      // );
  
      // Custom resource to add tag to interface gateways and manage nat gateway:
      new CustomResource(scope, 'CustomResource', {
        serviceToken: provider.serviceToken,
        properties: {
          //natGateways: Object<ec2.GatewayConfig[]>
          natGateways: options.ngwys, 
          vpcId: options.vpc.vpcId,
          tags: [{ Key: 'environment', Value: options.environment }, { Key: 'solution', Value: options.solutionName }, { Key: 'costcenter', Value: options.costcenter }],
  
        },
      });

    }
      public _bind() {}
  }
    
export class VTVpc extends Construct {

  /** API construct */
  //public readonly vpc: ec2.Vpc;

  
  vpcId!: string;

  vpcArn!: string 

 

  constructor(parent: Stack, id: string, props: VpcOptionsBase) {
    super(parent, id);

    const natGatewayProvider = ec2.NatProvider.instance({
      instanceType: new ec2.InstanceType('t3.nano'),
    });

    

/* 
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


 */
    Tags.of(this).add('environment', props.environment);
    Tags.of(this).add('solution', props.solutionName);
    Tags.of(this).add('costcenter', props.costcenter);
    //Tags.of(this).add("ShutdownPolicy", "NoShutdown")


/*     new CfnOutput(this, 'VPCId', { value: constructVpc.vpcId, exportName: `${props.solutionName}:${props.environment}:VPCID:${parent.region}` } );

    //new CfnOutput(this, 'NatGateways', { value: natGatewayProvider.configuredGateways.toString()} );

    new CfnOutput(this, 'VPCCIDR', { value: constructVpc.vpcCidrBlock, exportName: `${props.solutionName}:VpcCIDR` } );

    new CfnOutput(this, 'VPCPrivateSubnet0', { value: constructVpc.privateSubnets[0].subnetId, exportName: `${props.solutionName}:PrivateSubnet0` } );

    new CfnOutput(this, 'VPCPrivateSubnet1', { value: constructVpc.privateSubnets[1].subnetId, exportName: `${props.solutionName}:PrivateSubnet1` } );

    new CfnOutput(this, 'VPCPrivateSubnet2', { value: constructVpc.privateSubnets[2].subnetId, exportName: `${props.solutionName}:PrivateSubnet2` } );

    new CfnOutput(this, 'VPCPrivateSubnet0-AZ', { value: constructVpc.privateSubnets[0].availabilityZone, exportName: `${props.solutionName}:PrivateAZ0` });

    new CfnOutput(this, 'VPCPrivateSubnet1-AZ', { value: constructVpc.privateSubnets[1].availabilityZone, exportName: `${props.solutionName}:PrivateAZ1` });

    new CfnOutput(this, 'VPCPrivateSubnet2-AZ', { value: constructVpc.privateSubnets[2].availabilityZone, exportName: `${props.solutionName}:PrivateAZ2` });

    new CfnOutput(this, 'EC2SecurityGroup', { value: ec2SG.securityGroupId, exportName: `${props.solutionName}:EC2SecurityGroup` } );

    new CfnOutput(this, 'LogGroupName', { value: logGroup.logGroupName }); */


  }
}