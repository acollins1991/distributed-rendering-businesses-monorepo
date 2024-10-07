export default function FormInput({
    type,
    label,
    name,
    placeholder,
    required
}: {
    label: string,
    type: HTMLInputElement["type"],
    name: string,
    placeholder?: string
    required?: boolean
}) {
    return <>
        <label htmlFor={name} className="block text-sm font-medium leading-6 text-gray-900">
            {label}
        </label>
        <input
            name={name}
            type={type}
            placeholder={placeholder}
            className="block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            required={Boolean(required)}
        />
    </>
}