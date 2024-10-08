import { useEffect, useState } from "react";
import AppLoginForm from "../components/AppLoginForm";
import AppSignUpForm from "../components/AppSignUpForm";
import { useUserStore } from "../stores/user";
import { useNavigate } from "react-router-dom";

export default function Login() {

    const [signingUp, setSigninUp] = useState(false)
    const isAuthenticated = useUserStore(state => state.isAuthenticated)
    const navigate = useNavigate()

    useEffect(() => {
        if( isAuthenticated ) {
            navigate('/')
        }
    }, [isAuthenticated])

    function signUpButtonHandler() {
        setSigninUp(true)
    }

    return <div className="w-full h-full">

        {signingUp ? <AppSignUpForm /> : <AppLoginForm />}

        <div>
            <button onClick={signUpButtonHandler}>Sign Up</button>
        </div>
    </div>
}