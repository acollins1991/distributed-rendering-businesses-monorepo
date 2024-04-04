import { describe, beforeAll, test, expect, afterAll } from "bun:test"
import { client as db } from "../../db/index"
import createTeam from "../createTeam"
// import { mockClient } from 'aws-sdk-client-mock';
import { mock } from "jest-mock-extended"
import type { CloudFrontRequestEvent } from "aws-lambda"

describe('createTeam', () => {

    // let dynamoDBMock;

    // beforeAll(() => {
    //     dynamoDBMock = mockClient(db);
    // })


    // test('creates a new team record', async () => {
    //     const team = await createTeam(mock<CloudFrontRequestEvent>())
    //     expect(team).toBe(false)
    // })
})