// async function setTokenCookie(token: string) {
//     document.cookie = `friendly_sites_token=${token}`
// }

// export async function signinFetch(details) {
//     const res = await $fetch("/api/signin", {
//         method: "POST",
//         body: JSON.stringify(details)
//     })

//     setTokenCookie(res.token)

//     return res
// }

// export async function signupFetch(details) {
//     const res = await $fetch("/api/signup", {
//         method: "POST",
//         body: JSON.stringify(details)
//     })

//     setTokenCookie(res.token)

//     return res
// }