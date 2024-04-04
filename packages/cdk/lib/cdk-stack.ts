/**
 * Setup refs;
 * 
 * Use hono to create api in friendly-sites-api package https://hono.dev/getting-started/aws-lambda#access-aws-lambda-object
 * Use BunFun referenced in https://medium.com/@jolodev/run-bun-run-721700a94a08 to consume the api handler
 * Typing issue when using BunFun with LambdaRestApi
 */

import * as cdk from "aws-cdk-lib";
import { FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path from "path"
import * as apigw from 'aws-cdk-lib/aws-apigateway'

import { BunFun } from "../constructs/BunFun"

export class BunCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new BunFun(this, 'BunFunction', {
      entrypoint: path.join(__dirname, '../../friendly-sites-api/index.ts'),
      handler: 'handler',
      functionUrlAuthType: FunctionUrlAuthType.NONE,
      bunConfig: {
        target: "bun"
      }
    })

    const api = new apigw.LambdaRestApi(this, 'myapi', {
      handler: fn,
    })

    new cdk.CfnOutput(this, "BunApiUrl", {
      value: api.url ?? "Something went wrong with the deployment",
    });
  }
}

// import * as cdk from 'aws-cdk-lib';
// import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

// export class CdkStack extends cdk.Stack {
//   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     // The code that defines your stack goes here

//     // example resource
//     const queue = new sqs.Queue(this, 'CdkQueue', {
//       visibilityTimeout: cdk.Duration.seconds(300)
//     });
//   }
// }

// import * as cdk from 'aws-cdk-lib'
// import { Construct } from 'constructs'
// import * as lambda from 'aws-cdk-lib/aws-lambda'
// import * as apigw from 'aws-cdk-lib/aws-apigateway'
// import { Code, LayerVersion, Runtime, Function, Architecture } from "aws-cdk-lib/aws-lambda";
// import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
// import path from "path"

// export class MyAppStack extends cdk.Stack {
//   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props)

//     const layer = LayerVersion.fromLayerVersionArn(
//       this,
//       "BunLayer",
//       // Follow https://github.com/oven-sh/bun/tree/main/packages/bun-lambda#setup
//       // and deploy the layer to your account
//       // then get the ARN from the AWS Console under Lambda -> Layers
//       "arn:aws:lambda:us-east-1:648568751601:layer:bun:2"
//     );

//     const fn = new NodejsFunction(this, 'lambda', {
//       entry: path.join(__dirname, '../../friendly-sites-api/index.ts'),
//       handler: 'handler',
//       runtime: lambda.Runtime.NODEJS_20_X,
//       depsLockFilePath: path.join(__dirname, '../../../yarn.lock')
//     })
//     fn.addFunctionUrl({
//       authType: lambda.FunctionUrlAuthType.NONE,
//     })
//     new apigw.LambdaRestApi(this, 'myapi', {
//       handler: fn,
//     })
//   }
// }
