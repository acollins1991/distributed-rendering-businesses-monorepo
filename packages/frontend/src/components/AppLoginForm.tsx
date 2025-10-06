import { useEffect, useState, type FormEventHandler } from 'react'
import { client } from '../utils/useApi'
import FormInput from './FormInput'
import { useUserStore } from '../stores/user'
import { useNavigate } from 'react-router-dom'

export default function AppLoginForm() {

    const [isBusy, setIsBusy] = useState(false)
    const setToken = useUserStore((state) => state.setToken)

    const formHandler: FormEventHandler<HTMLFormElement> = async (event: Event) => {

        event.preventDefault()

        setIsBusy(true)

        const form = event.target as HTMLFormElement
        const details = new FormData(form).entries().reduce((accumulator: Record<string, any>, current: [string, any]) => {
            accumulator[current[0]] = current[1]
            return accumulator
        }, {})

        try {
            const res = await client.api.signin.$post({
                json: details
            })
            const { token } = await res.json()
            setToken(token)
        } catch (e) {
            console.log(e)
        } finally {
            setIsBusy(false)
        }
    }

    const isAuthenticated = useUserStore((state) => state.isAuthenticated)
    const navigate = useNavigate()

    function signUpButtonHandler() {
        navigate('/signup')
    }

    return (
        <>
            <form onSubmit={formHandler}>
                <div className="mb-3 items-center flex justify-center text-white h-24 rounded-md bg-slate-800">
                    <h3 className="text-2xl">
                        Sign In
                    </h3>
                </div>
                <div className='mb-3'>
                    <div className='mb-2'>
                        <FormInput name="email" label="Email" type="email" required />
                    </div>
                    <FormInput name="password" label="Password" type="password" required={true} />
                </div>

                <button type='submit' disabled={isBusy} className="w-full rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                    Login
                </button>
            </form>

            <div className="p-6 pt-0">
                <p className="flex justify-center mt-6 text-sm text-slate-600">
                    Don't have an account? <button onClick={signUpButtonHandler} className="ml-1 text-sm font-semibold text-slate-700 underline">Create an account</button>
                </p>
            </div>
        </>
    )
}
