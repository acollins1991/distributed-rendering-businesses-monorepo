import { test, describe } from "bun:test"
import cdk from "aws-cdk-lib"
import { BunCdkStack } from "../lib/cdk-stack";
import { Template } from "aws-cdk-lib/assertions";

describe('cdk stack', () => {
    test('API Created', () => {
        console.log('starting')
        const app = new cdk.App();
        //     // WHEN
        const stack = new BunCdkStack(app, 'MyTestStack');
        //     // THEN
        const template = Template.fromStack(stack);

        console.log('starting 1')
        template.hasResourceProperties('AWS::SQS::Queue', {
            VisibilityTimeout: 300
        });

        console.log('starting 2')
    });
})
