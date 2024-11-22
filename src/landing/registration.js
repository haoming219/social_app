import React, { useState, useEffect } from 'react';
import {useNavigate} from "react-router-dom";

function Register(){
        const [formData, setFormData] = useState({
            id:'',
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

        const [errors, setErrors] = useState({});
        const navigate = useNavigate();
        const [loginData, setLoginData] = useState({
            username: '',
            password: '',
        });
        const [users, setUsers] = useState([{
            id: 1,
            name: 'Leanne Graham',
            username: 'Bret',
            email: 'Sincere@april.biz',
            address: {
                street: 'Kulas Light',
                suite: 'Apt. 556',
                city: 'Gwenborough',
                zipcode: '92998-3874',
                geo: {
                    lat: '-37.3159',
                    lng: '81.1496',
                },
            },
            phone: '1-770-736-8031 x56442',
            website: 'hildegard.org',
            company: {
                name: 'Romaguera-Crona',
                catchPhrase: 'Multi-layered client-server neural-net',
                bs: 'harness real-time e-markets',
            },
        },]);  // To store fetched users
        const [authorMessage, setAuthorMessage] = useState('');
        const [authorMessageType, setAuthorMessageType] = useState('');
        // Fetch users from the JSON placeholder API
        useEffect(() => {
            const fetchUsers = async () => {
                try {
                    const response = await fetch('https://jsonplaceholder.typicode.com/users');
                    const data = await response.json();
                    setUsers(data);
                } catch (error) {
                    console.error('Failed to fetch users:', error);
                }
            };

            fetchUsers();
        }, []);
        // Handle form field changes
        const handleChange = (e) => {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
            });
        };

        const handleLoginChange = (e) => {
            setLoginData({
                ...loginData,
                [e.target.name]: e.target.value,
            });
        };

        // Form validation and submission
        const handleSubmit = (e) => {
            e.preventDefault();

            // Password match validation
            if (formData.password !== formData.confirmPassword) {
                setAuthorMessage('Passwords do not match!');
                setAuthorMessageType('error');
                setTimeout(() => {
                    setAuthorMessage(''); // Clear message after 1 second
                    setAuthorMessageType('');
                }, 3000);
                return;
            }

            // Age validation (18 or older)
            const dob = new Date(formData.dob);
            const today = new Date();
            let ageDiff = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                ageDiff--;
            }
            if (ageDiff < 18) {
                // alert("You must be 18 years or older to register.");
                setAuthorMessage('You must be 18 years or older to register.');
                setAuthorMessageType('error');
                setTimeout(() => {
                    setAuthorMessage(''); // Clear message after 1 second
                    setAuthorMessageType('');
                }, 3000);
                return;
            }

            const accountExists = users.some(user => user.username.toLowerCase() === formData.accountName.toLowerCase());
            console.log(users)
            if (accountExists) {
                setAuthorMessage('This account name is already in use. Please choose another one.');
                setAuthorMessageType('error');

                // Clear the message after 3 seconds
                setTimeout(() => {
                    setAuthorMessage('');
                    setAuthorMessageType('');
                }, 3000);

                return; // Exit the function if account exists
            }

            // Additional validation (optional)
            setAuthorMessage('Register successful!');
            setAuthorMessageType('success');
            setTimeout(() => navigate('/main', { state: { formData, users} }), 3000);
            // Submit form logic here
        };

        const handleLoginSubmit = (e) => {
            e.preventDefault();
            const user = users.find(user => user.username === loginData.username);
            if (!user) {
                setAuthorMessage('User not Found! Please enter correct username!');
                setAuthorMessageType('error');
                setTimeout(() => {
                    setAuthorMessage(''); // Clear message after 1 second
                    setAuthorMessageType('');
                }, 3000);
                return;
            }
            // Validate password (using email as a simple password for testing)
            if (loginData.password === user.address.street) {
                setAuthorMessage('Login successful!');
                setAuthorMessageType('success');
                setTimeout(() => navigate('/main', { state: { user, users} }), 3000);
            } else {
                setAuthorMessage('Incorrect password!');
                setAuthorMessageType('error');
                setTimeout(() => {
                    setAuthorMessage(''); // Clear message after 1 second
                    setAuthorMessageType('');
                }, 3000);
            }
        };

        // Reset the form
        const handleReset = () => {
            setFormData({
                accountName: '',
                displayName: '',
                email: '',
                phone: '',
                dob: '',
                zipcode: '',
                password: '',
                confirmPassword: '',
                timestamp: Date.now(),
            });
        };

        return (
            <div className="container">
                <div className="row justify-content-center mt-5">
                    <div className="col-12 text-center">
                        <h1 className="mb-4">Welcome to folksZone</h1>
                        <img
                            src="https://images.pexels.com/photos/25748398/pexels-photo-25748398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                            alt="Logo" className="mb-4"
                            style={{height: '150px'}}/>
                    </div>
                </div>

                {authorMessage && (
                    <div
                        className={`alert ${authorMessageType === 'success' ? 'alert-success' : 'alert-danger'} mb-4 text-center`}
                        role="alert"
                        style={{fontSize: '1.25rem', fontWeight: 'bold'}}
                    >
                        {authorMessage}
                    </div>
                )}
                {/* Forms Section */}
                <div className="row justify-content-center mt-4">
                    {/* Register Form */}
                    <div className="col-md-5 auth-block p-4 border">
                        <h2 className="text-center mb-4">Register</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                {/* First row: Account Name and Display Name */}
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="accountName">Account Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="accountName"
                                            name="accountName"
                                            value={formData.accountName}
                                            onChange={handleChange}
                                            required
                                            pattern="[A-Za-z][A-Za-z0-9]*"
                                            title="Account name must start with a letter and can only contain letters and numbers"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="displayName">Display Name (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="displayName"
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Second row: Email and Phone */}
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="email">Email Address *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="phone">Phone Number *</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            pattern="[0-9]{10}"
                                            placeholder="1234567890"
                                            title="Phone number should be 10 digits"
                                        />
                                    </div>
                                </div>

                                {/* Third row: Date of Birth and Zip Code */}
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="dob">Date of Birth *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="dob"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="zipcode">Zip Code *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="zipcode"
                                            name="zipcode"
                                            value={formData.zipcode}
                                            onChange={handleChange}
                                            required
                                            pattern="^\d{5}(-\d{4})?$"
                                            title="Enter a valid U.S. ZIP code"
                                        />
                                    </div>
                                </div>

                                {/* Fourth row: Password and Confirm Password */}
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="password">Password *</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            data-testid="registerPassword"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label htmlFor="confirmPassword">Confirm Password *</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirmPassword"
                                            data-testid="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mt-4">
                                <button type="reset" className="btn btn-secondary" onClick={handleReset}>Clear</button>
                                <button type="submit" className="btn btn-primary" aria-label="Register Button">Register</button>
                            </div>
                        </form>
                    </div>


                    {/* Login Form */}
                    <div className="col-md-5 auth-block p-4 border ms-md-4">
                        <h2 className="text-center mb-4">Login</h2>
                        <form onSubmit={handleLoginSubmit}>
                            <div className="form-group mb-3">
                                <label htmlFor="loginUsername">Username *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="loginUsername"
                                    data-testid="loginUsername"
                                    name="username"
                                    value={loginData.username}
                                    onChange={handleLoginChange}
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="loginPassword">Password *</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="loginPassword"
                                    data-testid="loginPassword"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-100" aria-label='Login Button'>Login</button>
                        </form>
                    </div>
                </div>
            </div>


        );
}

export default Register;
