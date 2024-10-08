import { format } from "date-fns"

export default function formatTimestamp(timestamp: number) {
    return format(new Date(timestamp), 'MMMM d, y')
}   