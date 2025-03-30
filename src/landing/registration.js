import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import './landing.css';

const BASE_URL = 'http://localhost:4000'; // 本地服务器地址
// const BASE_URL = 'https://social-app-ricebook-d655c5672da1.herokuapp.com'; // 注释掉原来的

function Register() {
    const [formData, setFormData] = useState({
        id: '',
        accountName: '',
        displayName: '',
        email: '',
        phone: '',
        dob: '',
        zipcode: '',
        password: '',
        confirmPassword: '',
        timestamp: new Date().toLocaleDateString(),
    });

    const [authorMessage, setAuthorMessage] = useState('');
    const [authorMessageType, setAuthorMessageType] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setAuthorMessage('Passwords do not match!');
            setAuthorMessageType('error');
            setTimeout(() => {
                setAuthorMessage('');
                setAuthorMessageType('');
            }, 3000);
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/register`, formData, {
                withCredentials: true,
            });
            setAuthorMessage('Register successful!');
            setAuthorMessageType('success');
            setTimeout(() => navigate('/main', { state: { user: response.data.username } }), 1000);
        } catch (error) {
            setAuthorMessage(error.response?.data?.message || 'Register failed');
            setAuthorMessageType('error');
            setTimeout(() => {
                setAuthorMessage('');
                setAuthorMessageType('');
            }, 3000);
        }
    };

    const handleReset = () => {
        setFormData({
            accountName: '',
            displayName: '',
            email: '',
            phone: '',
            dob: '',
            zipcode: '',
            password: '',
            picture: '',
            confirmPassword: '',
            timestamp: Date.now(),
        });
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
                    <p className="subtitle">Join our community today.</p>
                    
                    {authorMessage && (
                        <div className={`message ${authorMessageType}`}>
                            {authorMessage}
                        </div>
                    )}

                    <div className="login-form">
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="accountName"
                                    value={formData.accountName}
                                    onChange={handleChange}
                                    placeholder="Account Name *"
                                    required
                                    pattern="[A-Za-z][A-Za-z0-9]*"
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    placeholder="Display Name (Optional)"
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email Address *"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Phone Number *"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="zipcode"
                                    value={formData.zipcode}
                                    onChange={handleChange}
                                    placeholder="Zip Code *"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password *"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm Password *"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    Sign Up
                                </button>
                                <button type="button" onClick={handleReset} className="reset-btn">
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="signup-section">
                        <p>Already have an account?</p>
                        <button 
                            onClick={() => navigate('/')} 
                            className="signup-btn"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
