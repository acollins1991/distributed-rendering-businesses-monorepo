import { Link } from "react-router-dom";
import AppSignUpForm from "../components/AppSignUpForm";

export default function () {
    return <div className="d-flex justify-content-center align-items-center min-vw-100 min-vh-100">

        <div className="card p-3" style={
            {
                width: "18rem"
            }
        }>
            <AppSignUpForm />
            <Link to="/login">Login</Link>
        </div>

    </div >
}