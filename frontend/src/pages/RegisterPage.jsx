import React, { useState } from 'react';
import SelectRole from '../components/registerPage/SelectRole';
import RegisterForm from '../components/registerPage/RegisterForm';
import '../styles/registerPage/RegisterPage.css';

export function RegisterPage() {
    const [role, setRole] = useState(null); // State to store the selected role

    return (
        <div className="container py-5 ">
            {!role ? (
                // Show SelectRole component if no role is selected
                <SelectRole setRole={setRole} className="mb-5 mt-5 vh-100 " />
            ) : (
                // Show RegisterForm component after role selection
                <RegisterForm role={role} />
            )}
        </div>
    );
}
