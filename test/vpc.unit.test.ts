//import { countResources, expect as expectCDK } from '@aws-cdk/assert';
import { App, Stack } from 'aws-cdk-lib';
//import { Match, Template } from 'aws-cdk-lib/assertions';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { VTVpc } from '../src/vpc';


test('vpc unit test', () => {
  const app = new App();
  const stack = new Stack(app, 'testStack', {
    env: { account: '111122223333', region: 'us-east-1' },
  });

  new VTVpc(stack, 'VTVpicConstruct', {
    solutionName: 'UnitestVPC',
    costcenter: 'tnc',
    environment: 'test',
    name: 'testvpc',
    cidr: '172.16.0.0/16',
  });

  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::EC2::VPC', 1);
});

test('confirm vpc property output ', () => {
  const app = new App();
  const stack = new Stack(app, 'testStack', {
    env: { account: '111122223333', region: 'us-east-1' },
  });

  const testvpc = new VTVpc(stack, 'VTVpicConstruct', {
    solutionName: 'UnitestVPC',
    costcenter: 'tnc',
    environment: 'test',
    name: 'testvpc',
    cidr: '172.16.0.0/16',
  });

  Template.fromStack(stack);
  //template.resourceCountIs('AWS::Lambda::Function', 1);
  expect(testvpc.vpc).toBeInstanceOf(Vpc);
});

test('confirm default cidr created ', () => {
  const app = new App();
  const stack = new Stack(app, 'testStack', {
    env: { account: '111122223333', region: 'us-east-1' },
  });

  new VTVpc(stack, 'VTVpicConstruct', {
    solutionName: 'UnitestVPC',
    costcenter: 'tnc',
    environment: 'test',
    name: 'testvpc',
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::EC2::VPC', {
    // PublicAccessBlockConfiguration: Match.objectEquals({
    //   BlockPublicAcls: true,
    //   BlockPublicPolicy: true,
    //   IgnorePublicAcls: true,
    //   RestrictPublicBuckets: true,
    // }),
    CidrBlock: Match.exact('172.16.0.0/16'),
  });
});


/*
describe('fail test', () => {
  test('no cidr provided', () => {
    const app = new App();
    const stack = new Stack(app, 'testStack', {
      env: { account: '111122223333', region: 'us-east-1' },
    });
    expect(() => {
     new VTVpc(stack, 'VTVpicConstruct', {
        solutionName: 'UnitestVPC',
        costcenter: 'tnc',
        environment: 'test',
        name: 'testvpc',
        //cidr: '172.16.0.0/16',
      });

    }).toThrowError();
  });
});
  */