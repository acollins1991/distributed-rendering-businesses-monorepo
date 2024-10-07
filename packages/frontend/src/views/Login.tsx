import { useState } from "react";
import AppLoginForm from "../components/AppLoginForm";
import AppSignUpForm from "../components/AppSignUpForm";

export default function Login() {

    const [signingUp, setSigninUp] = useState(false)

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