import path from 'node:path';
import { Construct } from 'constructs';
import type { FunctionUrlAuthType, IFunction } from 'aws-cdk-lib/aws-lambda';
import { Architecture, Code, Function, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as Bun from 'bun';
import { CfnOutput, Fn } from 'aws-cdk-lib';
import { AnyPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export interface BunFunPropsBase {
    entrypoint: string
    handler: string
    external?: Bun.BuildConfig["external"]
}

export interface BunFunPropsWithFunctionUrl extends BunFunPropsBase {
    functionsUrl: true
    functionUrlAuthType: FunctionUrlAuthType
}

export interface BunFunPropsWithoutFunctionUrl extends BunFunPropsBase {
    functionsUrl?: false
}

type BunFunProps = BunFunPropsWithFunctionUrl | BunFunPropsWithoutFunctionUrl

export class BunFun extends Construct {

    constructor(scope: Construct, id: string, props: BunFunProps) {
        super(scope, id);

        (async () => {
            try {
                let bunPath: string
                const bunFunctions = await Bun.build({
                    entrypoints: [props.entrypoint],
                    outdir: 'dist',
                    target: 'bun',
                    minify: true,
                    external: props.external ?? []
                })
                bunPath = path.dirname(bunFunctions.outputs[0].path)

                // const BunFunLayerArn = Fn.importValue('BunFunLayerArn')
                const BunRuntimeLayerArn = 'arn:aws:lambda:eu-west-2:258587214769:layer:bun:1'
                const layer = LayerVersion.fromLayerVersionArn(
                    this,
                    'imported-BunRuntimeLayer',
                    BunRuntimeLayerArn
                )

                const lambda = new Function(this, 'BunFunction', {
                    code: Code.fromAsset(bunPath),
                    handler: props.handler,
                    runtime: Runtime.PROVIDED_AL2,
                    layers: [layer],
                    architecture: Architecture.ARM_64,
                })

                lambda.addToRolePolicy(
                    new PolicyStatement({
                        actions: ['lambda:GetLayerVersion'],
                        resources: [BunRuntimeLayerArn],
                    }),
                )

                return lambda
            }
            catch (error) {
                console.error(error);
            }
        })()
    }
}