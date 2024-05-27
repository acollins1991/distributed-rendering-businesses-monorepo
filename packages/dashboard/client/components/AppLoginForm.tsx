import type { FormEvent } from "react"
import { useUserStore } from "../store/user"
import { useNavigate } from "react-router-dom";

export default () => {

    const { signinUser, refreshUser } = useUserStore()
    const navigate = useNavigate()

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const valid = form.checkValidity()

        const formData = new FormData(form)
        const submissionObject: {
            email?: string,
            password?: string
        } = {}
        formData.forEach((value: string, key: 'email' | 'password') => submissionObject[key] = value);

        try {
            const res = await signinUser(submissionObject as {
                email: string,
                password: string
            })

            if (!res?.token) {
                throw Error('Bad response')
            }

            await refreshUser()

            navigate('/')

        } catch (e) {
            console.error(e)
        }
    }

    return <form onSubmit={onSubmit}>
        <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" name="email" className="form-control" id="email" aria-describedby="emailHelp" required />
            <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
        </div>
        <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" name="password" className="form-control" id="password" required />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
    </form>
}