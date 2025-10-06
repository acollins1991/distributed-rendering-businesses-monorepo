import { useState, type FormEventHandler } from 'react'
import { client } from '../utils/useApi'
import FormInput from './FormInput'
import { useUserStore } from '../stores/user'
import { useNavigate } from 'react-router-dom'

export default function AppSignUpForm() {

    const [isBusy, setIsBusy] = useState(false)
    const setUser = useUserStore((state) => state.setUser)
    const navigate = useNavigate()

    const formHandler: FormEventHandler<HTMLFormElement> = async (event) => {

        event.preventDefault()

        setIsBusy(true)

        const form = event.target as HTMLFormElement
        const details = new FormData(form).entries().reduce((accumulator: Record<string, any>, current: [string, any]) => {
            accumulator[current[0]] = current[1]
            return accumulator
        }, {})

        try {
            const res = await client.api.signup.$post({
                json: details
            })
            setUser(res.token)
        } catch (e) {
            console.log(e)
        } finally {
            setIsBusy(false)
        }
    }

    function signInButtonHandler() {
        navigate('/login')
    }

    return (
        <>
            <form onSubmit={formHandler}>
                <div className=" mb-3 items-center flex justify-center text-white h-24 rounded-md bg-slate-800">
                    <h3 className="text-2xl">
                        Sign Up
                    </h3>
                </div>
                <div className='mb-3'>
                    <div className='mb-2'>
                        <FormInput name="first_name" label="First Name" type="text" required />
                    </div>
                    <div className='mb-2'>
                        <FormInput name="last_name" label="First Name" type="text" required />
                    </div>
                    <div className='mb-2'>
                        <FormInput name="email" label="Email" type="email" required />
                    </div>
                    <FormInput name="password" label="Password" type="password" required={true} />
                </div>

                <button type='submit' disabled={isBusy} className="w-full rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none">
                    Sign Up
                </button>
            </form>

            <div className="p-6 pt-0">
                <p className="flex justify-center mt-6 text-sm text-slate-600">
                    <button onClick={signInButtonHandler} className="ml-1 text-sm font-semibold text-slate-700 underline">Sign In</button>
                </p>
            </div>

        </>
    )
}
