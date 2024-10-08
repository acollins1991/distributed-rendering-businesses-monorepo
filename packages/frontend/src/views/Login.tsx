import { useEffect, useState } from "react";
import AppLoginForm from "../components/AppLoginForm";
import AppSignUpForm from "../components/AppSignUpForm";
import { useUserStore } from "../stores/user";
import { useNavigate } from "react-router-dom";

export default function Login() {

    const [signingUp, setSigninUp] = useState(false)
    const isAuthenticated = useUserStore(state => state.isAuthenticated)
    const user = useUserStore(state => state.user)
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated])

    function signUpButtonHandler() {
        setSigninUp(true)
    }

    function signInButtonHandler() {
        setSigninUp(false)
    }

    return <div className="w-screen h-screen flex justify-center items-center">
        <div className="flex flex-col bg-white shadow-sm border border-slate-200 w-96 rounded-lg">
            <div className="p-3">
                {signingUp ? <AppSignUpForm signInButtonHandler={signInButtonHandler} /> : <AppLoginForm signUpButtonHandler={signUpButtonHandler} />}
            </div>
        </div>

    </div>
}