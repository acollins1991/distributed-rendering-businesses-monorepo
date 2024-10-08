import { Link } from "react-router-dom";

export default function AddNewSiteCard() {
    return <Link to={'/add-new-site'} className='bg-white shadow-md p-3 aspect-square'>
        <div className="border-dotted border-4 border-gray-600 bg-slate-200 w-full h-full">
            <span>+</span>
        </div>
    </Link>
}