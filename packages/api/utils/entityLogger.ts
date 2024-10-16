import type { ElectroDBMethodTypes, ElectroEvent } from "electrodb";

const trackedValues: {
    method: Record<ElectroDBMethodTypes, number>,
    totalCalls: number
} = {
    method: {
        "put": 0,
        "get": 0,
        "query": 0,
        "scan": 0,
        "update": 0,
        "delete": 0,
        "remove": 0,
        "patch": 0,
        "create": 0,
        "batchGet": 0,
        "batchWrite": 0,
    },
    totalCalls: 0
}

function updateTracked(event: ElectroEvent) {
    trackedValues.method[event.method] += 1
    trackedValues.totalCalls += 1
}
export default function entityLogger(event: ElectroEvent) {
    // updateTracked(event)
    // console.log(trackedValues)
};