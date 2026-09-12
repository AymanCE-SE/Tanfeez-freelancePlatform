import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { loginUser } from '../api/auth';
import { validateEmail, isFieldEmpty, isPasswordTooShort } from '../utils/validation';
import { useDispatch, useSelector } from 'react-redux';
import { loginAction } from "../store/slices/authSlice";
import { getMyProfileAction, updateFreelancerProfileAction } from '../store/slices/userSlice';
import Swal from 'sweetalert2';



export default function LoginPage() {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isLoggedIn, error } = useSelector((state) => state.authSlice);
  useEffect(() => {
    const url = window.location.pathname;
    if (url === "/login" && isLoggedIn) {
      navigate("/");
    }
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEmailEmpty = isFieldEmpty(email);
  const isEmailValid = !isEmailEmpty && validateEmail(email);
  const showEmptyEmailError = (touched || submitted) && isEmailEmpty;
  const showInvalidEmailError = (touched || submitted) && !isEmailEmpty && !isEmailValid;

  const isPasswordEmpty = isFieldEmpty(password);
  const showPasswordError = (touched || submitted) && (isPasswordEmpty || isPasswordTooShort(password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched(true);
    setErrorMessage('');

    if (!isEmailValid || isPasswordEmpty || isPasswordTooShort(password)) return;

    
    await dispatch(loginAction({ email, password }))
      .unwrap()
      .then(() => {
         dispatch(getMyProfileAction()).unwrap();
        navigate("/");
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
    <div className="login-page login-container">

      <div className="login-card">
      <div className="logo-container">
        {/* <img src="logo/Tanfeez.png" alt="Tanfeez Logo" className="logo " /> */}
        <h2 className="text-center mb-4">Login to Tanfeez</h2>
      </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className={`mb-3 ${(showEmptyEmailError || showInvalidEmailError) ? 'was-validated' : ''}`}>
            <label htmlFor="email" className="form-label fs-5">Email</label>
            <input
              type="email"
              className={`form-control form-control-lg ${(showEmptyEmailError || showInvalidEmailError) ? 'is-invalid' : ''}`}
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              onBlur={handleBlur}
              required
            />
            {showEmptyEmailError && <div className="invalid-feedback">This field is required</div>}
            {showInvalidEmailError && <div className="invalid-feedback">Please enter a valid email address</div>}
          </div>

          {/* Password */}
          <div className={`mb-3 ${showPasswordError ? 'was-validated' : ''}`}>
            <label htmlFor="password" className="form-label fs-5">Password</label>

            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control form-control-lg pe-5 ${showPasswordError ? 'is-invalid' : ''}`}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                onBlur={handleBlur}
                required
              />

              {/* Eye Icon */}
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
            {isLoading ? 'Continuing...' : 'Continue'}
          </button>
        </form>

        {/* <div className="divider mb-3 d-flex align-items-center">
          <hr className="flex-grow-1" />
          <span className="mx-2 text-muted">or</span>
          <hr className="flex-grow-1" />
        </div> */}

        {/* Google Login Button */}
        {/* <button
          className="btn btn-outline-danger w-100 py-2 mb-3 d-flex align-items-center justify-content-center"
          onClick={handleGoogleLogin}
        >
          <i className="fab fa-google me-2"></i>
          Continue with Google
        </button> */}

        <div className="signup-prompt text-center mt-4">
          <p className="fs-6 mb-2">Don't have an account?</p>
          <a href="/Register" className="btn btn-outline-success">Sign Up</a>
        </div>
      </div>
    </div>
  );
}
