/**
 * Setup refs;
 * 
 * Use hono to create api in friendly-sites-api package https://hono.dev/getting-started/aws-lambda#access-aws-lambda-object
 * Use BunFun referenced in https://medium.com/@jolodev/run-bun-run-721700a94a08 to consume the api handler
 * Typing issue when using BunFun with LambdaRestApi
 */

import * as cdk from "aws-cdk-lib";
import type { IFunction } from "aws-cdk-lib/aws-lambda";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from "constructs";
import path from "path"
import * as apigw from 'aws-cdk-lib/aws-apigateway'

// build api handler outside cdk stack classes so we can await the build
const bunFunction = await Bun.build({
  entrypoints: [path.join(__dirname, '../../friendly-sites-api/index.ts')],
  outdir: 'dist',
  target: 'bun',
  minify: true,
  external: [
    "@aws-sdk/*",
    "@faker-js/faker",
    "@types/aws-lambda",
    "aws-lambda",
    "check-password-strength",
    "date-fns",
    "electrodb",
    "hono",
    "io-ts",
    "lucia",
    "oslo",
    "react",
    "react-dom",
    "ts-runtime",
    "zod"
  ]
})

export class BunCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // const BunRuntimeLayerArn = 'arn:aws:lambda:eu-west-2:258587214769:layer:bun:1'
    // const layer = lambda.LayerVersion.fromLayerVersionArn(
    //   this,
    //   'imported-BunRuntimeLayer',
    //   BunRuntimeLayerArn
    // )

    const fn: IFunction = new lambda.Function(this, 'HelloHandler', {
      code: lambda.Code.fromAsset(path.dirname(bunFunction.outputs[0].path)),
      handler: 'index.handler',
      runtime: lambda.Runtime.PROVIDED_AL2,
      // layers: [layer],
      // architecture: lambda.Architecture.ARM_64,
    });


    // console.log('creating api with function handler')
    // const api = new apigw.LambdaRestApi(this, 'myapi', {
    //   handler: fn,
    // })

    // console.log('creating cdk output')
    // new cdk.CfnOutput(this, "BunApiUrl", {
    //   value: api.url ?? "Something went wrong with the deployment",
    // });
  }
}
