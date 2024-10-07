import { useEffect, useState } from 'react'
import { client } from '../utils/useApi'
import FormInput from './FormInput'

export default function AppLoginForm() {

    const [isBusy, setIsBusy] = useState(false)
    const [isValid, setIsValid] = useState()

    async function formHandler(event: Event) {
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
            console.log(res)
        } catch(e) {
            console.log(e)
        } finally {
            setIsBusy(false)
        }
    }

    return (
        <>
            <form onSubmit={formHandler} className='bg-white shadow-md p-3'>
                <h1 className='mb-3'>Sign In</h1>
                <div className='mb-3'>
                    <div className='mb-2'>
                        <FormInput name="email" label="Email" type="email" required />
                    </div>
                    <FormInput name="password" label="Password" type="password" required={true} />
                </div>

                <button className={`rounded-none bg-indigo-500 text-white py-2 px-3 ${isBusy ?? 'disabled'}`} type='submit' disabled={isBusy}>Login</button>
            </form>
        </>
    )
}
