import { test, describe, expect } from "bun:test"
import { app } from ".."
import { entity } from "../entities/team"
import { mockDeep } from "vitest-mock-extended"
import type { LambdaBindings } from "../types"
import createUserFactory from "../factories/User"
import { createHostedZone } from "../utils/manageHostedZone"
import { friendlySitesDomainGenerator } from "../utils/friendlySitesDomainGenerator"

describe("/teams endpoints", () => {
    describe("POST", () => {

        test('returns a new team record with authorised user sub as default user', async () => {
            const authUser = createUserFactory()

            const res = await app.request("/teams", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    body: JSON.stringify({
                        name: 'Testing Team 123'
                    }),
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: authUser.id
                            }
                        }
                    }
                }
            })

            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.name).toBe('Testing Team 123')
            expect(json.users[0]).toBe(authUser.id)
        })
        test('returns a new team record with explicit users, including sub user', async () => {
            const authUser = createUserFactory()
            const teamName = 'Testing Team ' + crypto.randomUUID()

            const res = await app.request("/teams", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    body: JSON.stringify({
                        name: teamName,
                        users: [authUser.id, '345', '678']
                    }),
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: authUser.id
                            }
                        }
                    }
                }
            })

            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.name).toBe(teamName)
            expect(json.users).toEqual([authUser.id, '345', '678'])
        })
    })

    describe("PATCH", () => {
        test("updates the team record", async () => {
            const teamName = 'Team ' + crypto.randomUUID()
            const authUser = createUserFactory()

            const teamRes = await entity.create({
                name: teamName,
                users: [authUser.id]
            }).go()

            const team = teamRes.data

            const res = await app.request(`/teams/${team.teamId}`, {
                method: "PATCH",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    body: JSON.stringify({
                        name: 'Testing Team 123'
                    }),
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: authUser.id
                            }
                        }
                    }
                }
            })

            expect(res.status).toBe(200)

            // check record updated
            const teamRecord = await entity.get({ teamId: team.teamId }).go()
            expect(teamRecord.data?.name).toBe('Testing Team 123')
        })
    })

    describe("GET", () => {
        test("gets specific team record", async () => {
            let team
            const authUser = createUserFactory()

            const teamRes = await entity.create({
                name: 'Team ' + crypto.randomUUID(),
                users: [authUser.id]
            }).go()

            team = teamRes.data

            const res = await app.request(`/teams/${team.teamId}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    body: JSON.stringify({
                        name: 'Testing Team 123'
                    }),
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: authUser.id
                            }
                        }
                    }
                }
            })

            expect(res.status).toBe(200)
            expect((await res.json()).teamId).toBe(team.teamId)
        })
    })

    describe("DELETE", () => {

        test('removes team record from db', async () => {
            let team
            const teamName = 'Team ' + crypto.randomUUID()
            const authUser = createUserFactory()

            const teamRes = await entity.create({
                name: teamName,
                users: [authUser.id]
            }).go()

            team = teamRes.data

            const res = await app.request(`/teams/${team.teamId}`, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: authUser.id
                            }
                        }
                    }
                }
            })

            expect(res.status).toBe(200)
            const json = await res.json()
            // should return full record that has been deleted
            expect(json).toHaveProperty('teamId')
            expect(json).toHaveProperty('name')
            // expect no record to be returned
            expect(await entity.get({ teamId: team.teamId }).go()).toMatchObject({ data: null })
        })
    })
})