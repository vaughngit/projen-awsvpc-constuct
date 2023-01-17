//import { countResources, expect as expectCDK } from '@aws-cdk/assert';
import { App, Stack } from 'aws-cdk-lib';
//import { Match, Template } from 'aws-cdk-lib/assertions';
import { Template } from 'aws-cdk-lib/assertions';
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
    cidr: '172.16.0.0/16'
  });

  const template = Template.fromStack(stack);
  template.resourceCountIs('aws:ec2:vpc', 1);
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
        cidr: '172.16.0.0/16'
      });
  
    Template.fromStack(stack);
    //template.resourceCountIs('AWS::Lambda::Function', 1);
    expect(testvpc.vpc).toBeInstanceOf(Vpc);
  });

/*
describe('fail test', () => {
  test('no source code test', () => {
    expect(() => {
      const app = new App();
      const stack = new Stack(app, 'TestStack');
      new PowerToolsLambdaConstruct(stack, 'PowerToolsLambdaConstruct', {
        sourceCodedirPath: '',
      });
    }).toThrowError();
  });
});
 */