import type { FormEvent } from "react"
import { useUserStore } from "../store/user"
import { useNavigate } from "react-router-dom"

export default () => {

    const { signupUser, refreshUser } = useUserStore()
    const navigate = useNavigate()

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const valid = form.checkValidity()

        const formData = new FormData(form)
        const submissionObject: {
            email?: string,
            password?: string
        } = {}
        formData.forEach((value: string, key: string) => submissionObject[key] = value);

        signupUser(submissionObject).then(async () => {
            await refreshUser()
            navigate('/')
        })
    }

    return <form onSubmit={onSubmit}>
        <div className="mb-3">
            <label htmlFor="first_name" className="form-label">First Name</label>
            <input type="text" name="first_name" className="form-control" id="first_name" required />
        </div>
        <div className="mb-3">
            <label htmlFor="last_name" className="form-label">Last Name</label>
            <input type="text" name="last_name" className="form-control" id="last_name" required />
        </div>
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