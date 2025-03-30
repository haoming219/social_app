import React, {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'tailwindcss/tailwind.css';
import axios from 'axios';

axios.defaults.withCredentials = true;

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const forms = location.state?.formData || "";
    const user = location.state?.user || "";
    const BASE_URL = 'http://localhost:4000'; // 本地服务器地址
    // const BASE_URL = 'https://social-app-ricebook-d655c5672da1.herokuapp.com'; // 注释掉原来的
    const [formData, setFormData] = useState({
        username: user,
        email: '',
        phone: '',
        zipcode: '',
        password: '123',

        confirmpassword: '123',
    });
    const [editingField, setEditingField] = useState(null);

    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploadUrl, setUploadUrl] = useState('');

    const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [passwordDisplay, setPasswordDisplay] = useState('******');

    const handlePasswordUpdate = async () => {
        try {
            const response = await axios.put(`${BASE_URL}/password`, {
                password: newPassword
            }, {
                withCredentials: true
            });

            if (response.data.result === 'success') {
                // Create a string of asterisks based on the password length
                const maskedPassword = '*'.repeat(response.data.length);
                setPasswordDisplay(maskedPassword);

                alert('Password updated successfully');
                setShowPasswordUpdate(false);
                setNewPassword('');
            }
        } catch (error) {
            alert('Failed to update password');
            console.error('Password update error:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreviewUrl(URL.createObjectURL(file)); // For displaying a preview
    };

    const uploadToCloudinary = async () => {
        if (!image) {
            alert('Please select an image first');
            return;
        }

        const config = {
            headers:{
                "content-type":"multipart/form-data",
            }
        };
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'ricebook'); // Replace with your preset
        formData.append('cloud_name', 'dgrmxcicw'); // Your cloud name
        const CLOUDINARY_UPLOAD_PRESET = 'ricebook';
        const CLOUDINARY_CLOUD_NAME = 'dgrmxcicw';

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            const data = await response.json();
            const originalSecureUrl = data.secure_url;
            const secureUrl = originalSecureUrl.replace(
                '/upload/',
                '/upload/c_crop,g_face,r_max/'
            );
            setUploadUrl(secureUrl);

            const postToBackend = async (secureUrl) => {
                try {
                    const response = await axios.put(`${BASE_URL}/profile/avatar`, {
                            url: secureUrl,
                        },
                        {
                            withCredentials: true // Add this to send cookies/authentication
                        });

                    if (response.status === 200) {
                        console.log('Image URL saved to database successfully');
                    } else {
                        console.error('Failed to save image URL');
                    }
                } catch (error) {
                    console.error('Error saving image URL:', error);
                }
            };
            // Call your backend to store the secure URL
            await postToBackend(secureUrl);


            alert('Image uploaded and saved successfully!');
            setPreviewUrl('');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        }
    };



    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Fetch email
                const emailResponse = await axios.get(`${BASE_URL}/profile/email`, {
                    withCredentials: true,
                });

                // Fetch phone
                const phoneResponse = await axios.get(`${BASE_URL}/profile/phone`, {
                    withCredentials: true,
                });

                // Fetch zipcode
                const zipcodeResponse = await axios.get(`${BASE_URL}/profile/zipcode`, {
                    withCredentials: true,
                });

                const avatarResponse = await axios.get(`${BASE_URL}/profile/avatar/`, {
                    withCredentials: true,
                });

                // Update formData with fetched information
                setFormData(prevData => ({
                    ...prevData,
                    email: emailResponse.data.email || '',
                    phone: phoneResponse.data.phone || '',
                    zipcode: zipcodeResponse.data.zipcode || '',
                }));

                setUploadUrl(avatarResponse.data.url);

            } catch (error) {
                console.error('Error fetching profile data:', error.message);
            }
        };

        fetchProfileData();
    }, []);

    const backMainPage = () => {
        navigate('/main', { state: { user: user } });  // Pass the user data to profile page
    };

    const handleInputChange = (e, field) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleUpdateField = async (field) => {
        try {
            let endpoint;

            const value = formData[field];
            // Choose the appropriate endpoint based on the field
            switch (field) {
                case 'email':
                    endpoint = '/profile/email';
                    break;
                case 'phone':
                    endpoint = '/profile/phone';
                    break;
                case 'zipcode':
                    endpoint = '/profile/zipcode';
                    break;
                default:
                    throw new Error('Invalid field');
            }

            console.log(field,value);
            // Make the API call
            const response = await axios.put(`${BASE_URL}${endpoint}`,
                { [field]: value },
                {
                    withCredentials: true // Add this to send cookies/authentication
                }
            );

            if (response.status === 200) {
                alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
            } else {
                alert('Failed to update. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating data. Please check your network or try again later.');
        }
    };


    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div
                className="d-flex justify-content-between align-items-center bg-dark text-white px-4 py-3 position-sticky top-0 shadow-sm"
                style={{zIndex: 1000}}
            >
                {/* Branding */}
                <div className="d-flex align-items-center">

                    <button
                        className="btn btn-light d-flex align-items-center"
                        onClick={backMainPage}
                        aria-label="Go to Profile"
                    >
                        Back
                    </button>
                </div>

                {/* Icon Buttons */}
                <div className="d-flex align-items-center">
                    <img
                        src="https://cdn3.iconfinder.com/data/icons/letters-and-numbers-1/32/letter_R_blue-256.png"
                        alt="Logo"
                        className="me-3"
                        style={{width: '40px', height: '40px'}}
                    />
                    <h1 className="h5 m-0 fw-bold text-light">Ricebook</h1>
                </div>
            </div>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Profile Section */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 text-center relative">
                        <div className="absolute top-4 right-4 cursor-pointer hover:opacity-80 transition">
                            <i className="fas fa-cog text-xl"></i>
                        </div>
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-4">Image Upload</h2>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mb-4"
                            />
                            {previewUrl && (
                                <div className="mb-4">
                                    <img
                                        src={previewUrl}  // Fixed image for all friends
                                        className="bg-secondary rounded-circle text-center"
                                        style={{width: '60px', height: '60px'}}
                                    />
                                </div>
                            )}
                            <button
                                onClick={uploadToCloudinary}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Upload and Save
                            </button>
                            {uploadUrl && (
                                <div className="mt-4">
                                    <img
                                        src={uploadUrl}  // Fixed image for all friends
                                        className="bg-secondary rounded-circle text-center"
                                        style={{width: '60px', height: '60px'}}
                                    />
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-black">{formData.username}</h2>
                        <p className="text-sm opacity-80">User Profile</p>
                    </div>

                    {/* Profile Details */}
                    <div className="p-6 space-y-4 flex flex-col items-center">
                        {['email', 'phone', 'zipcode'].map((field) => (
                            <div className= "d-flex align-items-center justify-content-center"
                                key={field}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="d-flex align-items-center justify-content-center">
                                            <div className="text-muted text-center">
                                                {field}: {formData[field]}
                                            </div>
                                    </div>
                                    {editingField === field ? (
                                        <div >
                                            <input
                                                type={field === 'email' ? 'email' : 'text'}
                                                value={formData[field]}
                                                onChange={(e) => handleInputChange(e, field)}
                                                className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                            <button
                                                onClick={() => handleUpdateField(field)}
                                                className="text-green-500 hover:text-green-700 transform hover:scale-110 transition"
                                            >
                                                <i className="fas fa-check"></i>
                                            </button>
                                        </div>
                                    ) : (
                                            <button
                                                onClick={() => setEditingField(field)}
                                                className="text-green-500 hover:text-green-700 transform hover:scale-110 transition"
                                            >
                                                <i className="fas fa-pen"></i>
                                            </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="d-flex align-items-center justify-content-center">
                        {passwordDisplay && (
                            <div className="text-muted text-center">
                                Password: {passwordDisplay}
                            </div>
                        )}

                        {showPasswordUpdate ? (
                            <div className="d-flex align-items-center">
                                <input
                                    type="password"
                                    className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{width: '200px'}}
                                />
                                <button
                                    className="text-green-500 hover:text-green-700 transform hover:scale-110 transition"
                                    onClick={handlePasswordUpdate}
                                >
                                    <i className="fas fa-check"></i>
                                </button>
                            </div>
                        ) : (
                            <button
                                className="text-green-500 hover:text-green-700 transform hover:scale-110 transition"
                                onClick={() => setShowPasswordUpdate(true)}
                                aria-label="Change Password"
                            >
                                <i className="fas fa-pen"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Profile;
