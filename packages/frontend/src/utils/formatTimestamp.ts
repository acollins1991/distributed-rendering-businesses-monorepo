import { format } from "date-fns"

export default function formatTimestamp(timestamp: number, includeTime = false) {
    return format(new Date(timestamp), `${includeTime ? "p, " : ""}MMM d, y`)
}   