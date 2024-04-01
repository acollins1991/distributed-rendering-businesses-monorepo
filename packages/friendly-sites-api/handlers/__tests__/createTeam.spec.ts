import { describe, beforeAll, test, expect, afterAll } from "bun:test"
import { client as db } from "../../db/index"
import { mockClient } from 'aws-sdk-client-mock';

describe('createTeam', () => {

    let dynamoDBMock;

    beforeAll(() => {
        dynamoDBMock = mockClient(db);
    })



    test('creates a new team record', () => {
        expect(true).toBe(false)
    })
})