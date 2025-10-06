import AppSignUpForm from "../components/AppSignUpForm";

export default function Login() {
    return <div className="w-screen h-screen flex justify-center items-center">
        <div className="flex flex-col bg-white shadow-sm border border-slate-200 w-96 rounded-lg">
            <div className="p-3">
                <AppSignUpForm /> 
            </div>
        </div>

    </div>
}