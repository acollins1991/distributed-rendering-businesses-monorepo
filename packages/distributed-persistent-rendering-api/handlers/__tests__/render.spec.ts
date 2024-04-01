import { describe, test } from "bun:test"

import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import type { GetItemInput } from 'aws-sdk/clients/dynamodb';

import { handler } from "../render"

describe('render handler', () => {
    describe('successful request', () => {

        // const 
        test('Return result and cache', () => {

        })

    })
})