import { passwordStrength } from "check-password-strength";

export default function (password: string) {
    return passwordStrength(password, [
        {
            id: 0,
            value: "Too weak",
            minDiversity: 0,
            minLength: 0
        },
        {
            id: 1,
            value: "Valid",
            minDiversity: 2,
            minLength: 16
        },
    ])
}