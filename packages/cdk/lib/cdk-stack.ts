/**
 * Setup refs;
 * 
 * Use hono to create api in friendly-sites-api package https://hono.dev/getting-started/aws-lambda#access-aws-lambda-object
 * Use BunFun referenced in https://medium.com/@jolodev/run-bun-run-721700a94a08 to consume the api handler
 * Typing issue when using BunFun with LambdaRestApi
 */

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import path from "path"
import { buildClient } from "../../dashboard/utils/buildClient";
import { buildServer } from "../../dashboard/utils/buildServer";

const config = {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.LOCALSTACK_REGION
  }
}

console.log(config)

// build api handler outside cdk stack classes so we can await the build
const clientBuild = await buildClient(path.join(__dirname, '../dist/client'))
const serverBuild = await buildServer(path.join(__dirname, '../dist/server'))

export class BunCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, { ...props, env: config.env });

    const defaultVpc = cdk.aws_ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true })

    const role = new cdk.aws_iam.Role(
      this,
      'simple-instance-1-role', // this is a unique id that will represent this resource in a Cloudformation template
      { assumedBy: new cdk.aws_iam.ServicePrincipal('ec2.amazonaws.com') }
    )

    // const securityGroup = new cdk.aws_ec2.SecurityGroup(
    //   this,
    //   'simple-instance-1-sg',
    //   {
    //     vpc: defaultVpc,
    //     allowAllOutbound: true, // will let your instance send outboud traffic
    //     securityGroupName: 'simple-instance-1-sg',
    //   }
    // )

    // securityGroup.addIngressRule(
    //   cdk.aws_ec2.Peer.anyIpv4(),
    //   cdk.aws_ec2.Port.tcp(80),
    //   'Allows HTTP access from Internet'
    // )

    // securityGroup.addIngressRule(
    //   cdk.aws_ec2.Peer.anyIpv4(),
    //   cdk.aws_ec2.Port.tcp(443),
    //   'Allows HTTPS access from Internet'
    // )

    // Finally lets provision our ec2 instance
    // const instance = new cdk.aws_ec2.Instance(this, 'simple-instance-1', {
    //   vpc: defaultVpc,
    //   role: role,
    //   securityGroup: securityGroup,
    //   instanceName: 'simple-instance-1',
    //   instanceType: cdk.aws_ec2.InstanceType.of( // t2.micro has free tier usage in aws
    //     cdk.aws_ec2.InstanceClass.T2,
    //     cdk.aws_ec2.InstanceSize.MICRO
    //   ),
    //   machineImage: cdk.aws_ec2.MachineImage.latestAmazonLinux2(),

    //   keyName: 'simple-instance-1-key', // we will create this in the console before we deploy
    // })

    // cdk lets us output prperties of the resources we create after they are created
    // we want the ip address of this new instance so we can ssh into it later
    // new cdk.CfnOutput(this, 'simple-instance-1-output', {
    //   value: instance.instancePublicIp
    // })
  }
}
