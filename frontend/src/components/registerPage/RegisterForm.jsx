import React, { useEffect, useState } from 'react';
import '../../styles/Login.css';
import { validateEmail, isFieldEmpty, isPasswordTooShort } from '../../utils/validation';
import { useDispatch, useSelector } from 'react-redux';
import { registerAction } from "../../store/slices/authSlice";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2

export default function RegisterForm({ role }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, isLoggedIn, error } = useSelector((state) => state.authSlice);
    useEffect(() => {
        const url = window.location.pathname;
        if (url === "/register" && isLoggedIn) {
            navigate("/");
        }
    }, []);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        second_name: '',
        user_name: '',
        user_type: role,


    });
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const isEmailEmpty = isFieldEmpty(formData.email);
    const isEmailValid = !isEmailEmpty && validateEmail(formData.email);
    const showEmptyEmailError = (touched || submitted) && isEmailEmpty;
    const showInvalidEmailError = (touched || submitted) && !isEmailEmpty && !isEmailValid;

    const isPasswordEmpty = isFieldEmpty(formData.password);
    const showPasswordError = (touched || submitted) && (isPasswordEmpty || isPasswordTooShort(formData.password));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTouched(true);

        if (!isEmailValid || isPasswordEmpty || isPasswordTooShort(formData.password)) return;

        dispatch(registerAction(formData))
            .unwrap()
            .then(() => {
                // Show success alert
                Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful',
                    text: 'You have successfully registered! Redirecting to login...',
                    timer: 3000,
                    showConfirmButton: false,
                }).then(() => {
                    navigate("/login");
                });
            })
            .catch((error) => {
                // Extract error messages from the response
                const errorMessages = [];
                if (error.data) {
                    for (const key in error.data) {
                        if (Array.isArray(error.data[key])) {
                            errorMessages.push(...error.data[key]);
                        } else {
                            errorMessages.push(error.data[key]);
                        }
                    }
                }

                // Show error alert with the extracted messages
                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    html: errorMessages.join('<br>'), // Display messages as HTML
                });
            });
    };

    const handleBlur = () => setTouched(true);

    return (
        <div className="login-page app-page-container login-container">
            <div className="login-card app-card">
                <div className="logo-container">
                    {/* <img src="../logo/Tanfeez.png" alt="Tanfeez Logo" className="logo m-0" /> */}
                </div>
                <h2 className="text-center mb-5">{role === 'client' ? 'Register as Client' : 'Register as Freelancer'}</h2>

                <form onSubmit={handleSubmit} noValidate>
                    {/* First Name */}
                    <div className="mb-3">
                        <label htmlFor="first_name" className="form-label fs-5">First Name</label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                            required
                        />
                    </div>

                    {/* Last Name */}
                    <div className="mb-3">
                        <label htmlFor="second_name" className="form-label fs-5">Last Name</label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            id="second_name"
                            name="second_name"
                            value={formData.second_name}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className={`mb-3 ${(showEmptyEmailError || showInvalidEmailError) ? 'was-validated' : ''}`}>
                        <label htmlFor="email" className="form-label fs-5">Email</label>
                        <input
                            type="email"
                            className={`form-control form-control-lg ${(showEmptyEmailError || showInvalidEmailError) ? 'is-invalid' : ''}`}
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            onBlur={handleBlur}
                            required
                        />
                        {showEmptyEmailError && <div className="invalid-feedback">This field is required</div>}
                        {showInvalidEmailError && <div className="invalid-feedback">Please enter a valid email address</div>}
                    </div>

                    {/* Username */}
                    <div className="mb-3">
                        <label htmlFor="user_name" className="form-label fs-5">Username</label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            id="user_name"
                            name="user_name"
                            value={formData.user_name}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className={`mb-3 ${showPasswordError ? 'was-validated' : ''}`}>
                        <label htmlFor="password" className="form-label fs-5">Password</label>
                        <div className="position-relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={`form-control form-control-lg pe-5 ${showPasswordError ? 'is-invalid' : ''}`}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                onBlur={handleBlur}
                                required
                            />
                            <i
                                className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    right: '15px',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    color: '#6c757d',
                                    zIndex: 2,
                                }}
                            ></i>
                        </div>
                        {showPasswordError && (
                            <div className="invalid-feedback d-block">
                                {isPasswordEmpty ? 'This field is required' : 'Password must be at least 6 characters'}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn continue-btn w-100 mb-4 py-3"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="signup-prompt text-center mt-4">
                    <p className="fs-6 mb-2">Already have an account?</p>
                    <a href="/login" className="btn btn-outline-success">Sign In</a>
                </div>
            </div>
        </div>
    );
}
