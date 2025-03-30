import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup } from "firebase/auth";
import './landing.css';


const BASE_URL = 'http://localhost:4000'; // 本地服务器地址
// const BASE_URL = 'https://social-app-ricebook-d655c5672da1.herokuapp.com'; // 注释掉原来的

function Login() {
    const [loginData, setLoginData] = useState({
        accountName: '',
        password: '',
    });
    const [authorMessage, setAuthorMessage] = useState('');
    const [authorMessageType, setAuthorMessageType] = useState('');
    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value,
        });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${BASE_URL}/login`, loginData, {
                withCredentials: true,
            });
            setAuthorMessage("Login successful");
            setAuthorMessageType('success');
            setTimeout(() => {
                navigate('/main', { state: { user: response.data.username } });
            }, 1000);
        } catch (error) {
            setAuthorMessage(error.response?.data?.message || 'Login failed');
            setAuthorMessageType('error');
            setTimeout(() => {
                setAuthorMessage('');
                setAuthorMessageType('');
            }, 3000);
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const googleUserData = {
                accountName: user.displayName || user.email.split('@')[0],
                displayName: user.displayName,
                email: user.email,
                picture: user.photoURL,
                dob: "2000-01-01",
                zipcode: "00001",
                phone: "888-888-8888",
                password: "123456",
            };

            const response = await axios.post(`${BASE_URL}/register`, googleUserData, {
                withCredentials: true,
            });
            setAuthorMessage('Welcome to Ricebook!');
            setAuthorMessageType('success');
            setTimeout(() => navigate('/main', { state: { user: response.data.username } }), 3000);
        } catch (error) {
            setAuthorMessage(error.response?.data?.message || 'Google Login failed');
            setAuthorMessageType('error');
            setTimeout(() => {
                setAuthorMessage('');
            }, 3000);
        }
    };

    return (
        <div className="landing-container">
            <div className="landing-left">
                <img 
                    src="https://images.pexels.com/photos/3014019/pexels-photo-3014019.jpeg" 
                    alt="Aesthetic" 
                    className="feature-image"
                />
            </div>
            <div className="landing-right">
                <div className="content-wrapper">
                    <h1 className="brand-title">folksZone</h1>
                    <p className="subtitle">Connect with friends and share your moments.</p>
                    
                    {authorMessage && (
                        <div className={`message ${authorMessageType}`}>
                            {authorMessage}
                        </div>
                    )}

                    <div className="login-form">
                        <form onSubmit={handleLoginSubmit}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="accountName"
                                    value={loginData.accountName}
                                    onChange={handleLoginChange}
                                    placeholder="Email Address"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    placeholder="Password"
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-btn">
                                Sign In
                            </button>
                        </form>

                        <div className="divider">
                            <span>or</span>
                        </div>
                        
                        <button onClick={signInWithGoogle} className="google-btn">
                            Continue with Google
                        </button>
                    </div>

                    <div className="signup-section">
                        <p>Don't have an account?</p>
                        <button 
                            onClick={() => navigate('/register')} 
                            className="signup-btn"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
