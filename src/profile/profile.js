import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'tailwindcss/tailwind.css';


const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const forms = location.state?.formData || "";
    const user = location.state?.user || "";
    const users = location.state?.users || [];
    const [formData, setFormData] = useState({
        username: user.username?user.username:forms.accountName,
        email: '123@rice.edu',
        phone: '1234567890',
        zipcode: '77005',
        password: '123',
        confirmpassword:'123',
    });
    const [tempData, setTempData] = useState(formData);

    const handleUpdate = (e) => {
        e.preventDefault();  // Prevents page refresh on form submission
        if (tempData.password !== tempData.confirmPassword) {
            alert('sorry, the password does not match. Pleas try again')
            return;
        }
        setFormData(tempData);  // Update formData with tempData
        setTempData({ username: '', email: '', phone: '', zipcode: '', password: '',confirmpassword: '' });
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    return (
        <div className="container-fluid min-vh-100 bg-light py-6">
            <div className="container bg-white shadow rounded p-5">
                {/* Top Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <button
                        onClick={() => navigate('/main', {state: {user, users}})}
                        className="btn btn-primary"
                        style={{width: '150px'}} // To limit button width
                    >
                        Main Page
                    </button>
                    <h1 className="h4 font-weight-bold text-primary">Profile Page</h1>
                </div>

                {/* User Avatar and Upload */}
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div className="text-center">
                        <img
                            src={`https://images.pexels.com/photos/28824456/pexels-photo-28824456.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load`}
                            className="rounded-circle"
                            style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                border: '2px solid #007bff'
                            }} // Avatar style improved
                        />
                        <input
                            type="file"
                            id="imageInput"
                            name="image"
                            accept="image/*"
                            className="form-control-file mt-3"
                        />
                    </div>

                    {/* Placeholder for Logo */}
                    <div className="text-center">
                        <h2 className="h4 font-weight-bold text-secondary">FolksZone</h2>
                        <p className="font-italic text-muted">A place for folks</p>
                    </div>
                </div>
            {/* Info Sections */}
            <div className="row">
                {/* Current Info */}
                <div className="col-md-6 bg-light p-4 rounded mb-4">
                    <h3 className="h6 font-weight-bold mb-3">Current Info</h3>
                    <p>User name: {formData.username}</p>
                    <p>Email Address{formData.email}</p>
                    <p>Phone Number{formData.phone}</p>
                    <p>Zip Code: {formData.zipcode}</p>
                    <p>User Password: {'*'.repeat(formData.password.length)}</p>
                </div>

                {/* Update Info Form */}
                <div className="col-md-6 p-4 border rounded">
                    <form onSubmit={handleUpdate}>
                        <div className="form-group">
                            <label htmlFor="username">User Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                name="username"
                                value={tempData.username}
                                onChange={handleChange}
                                pattern="[A-Za-z][A-Za-z0-9]*"
                                title="Account name must start with a letter and can only contain letters and numbers"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={tempData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number *</label>
                            <input
                                type="tel"
                                className="form-control"
                                id="phone"
                                name="phone"
                                value={tempData.phone}
                                pattern="[0-9]{10}"
                                title='Phone number should be 10 digits'
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="zipcode">Zip Code *</label>
                            <input
                                type="text"
                                className="form-control"
                                id="zipcode"
                                name="zipcode"
                                value={tempData.zipcode}
                                pattern="^\d{5}(-\d{4})?$"
                                title='Pleas enter a valid U.S zipcode'
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                value={tempData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={tempData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="d-flex justify-content-between mt-3">
                            <button type="submit" className="btn btn-primary">
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
</div>
)
    ;
};

export default Profile;
