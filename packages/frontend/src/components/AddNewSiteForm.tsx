import { useEffect, useState, type FormEventHandler } from 'react'
import { client } from '../utils/useApi'
import FormInput from './FormInput'

export default function AddNewSiteForm() {

    const [isBusy, setIsBusy] = useState(false)

    const formHandler: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault()

        setIsBusy(true)

        const form = event.target as HTMLFormElement
        const details = new FormData(form).entries().reduce((accumulator: Record<string, any>, current: [string, any]) => {
            accumulator[current[0]] = current[1]
            return accumulator
        }, {})

        try {
            const res = await client.api.sites.$post({
                json: details
            })
        } catch (e) {
            console.log(e)
        } finally {
            setIsBusy(false)
        }
    }

    return (
        <>
            <form onSubmit={formHandler} className='bg-white shadow-md p-3'>
                <div className='mb-3'>
                    <FormInput name="name" label="Site Name" type="text" required />
                </div>

                <button className={`rounded-none bg-indigo-500 text-white py-2 px-3 ${isBusy ?? 'disabled'}`} type='submit' disabled={isBusy}>Create</button>
            </form>
        </>
    )
}
