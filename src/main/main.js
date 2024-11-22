import React, {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Posts from "./posts";
import '@fortawesome/fontawesome-free/css/all.min.css';

const MainPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const forms = location.state?.formData || "";
    const user = location.state?.user || "";
    const users = location.state?.users;
    // Local state to manage user's status (non-persistent)
    const [status, setStatus] = useState((user? user.company.catchPhrase:'') || 'Guest');  // Default status
    const [newFriend, setNewFriend] = useState('');
    const [friends, setFriends] = useState(() => {
        const potentialFriends = [...Array(3)].map((_, index) => {
            const friendId = user.id ? (user.id + index + 1) % 10 : forms.id;
            return users.find(u => u.id === friendId);
        });

        // Filter out any undefined friends (where no match was found)
        return potentialFriends.filter(friend => friend) || []; // Return an empty array if no friends found
    });
    // Logout handler
    const handleLogout = () => {
        // Clear all relevant local states
        setStatus('Guest'); // Reset status to default
        setNewFriend('');   // Clear new friend input
        setFriends([]);     // Reset friends list to an empty array

        // Clear data from localStorage or sessionStorage if applicable
        localStorage.clear();  // Clears all data from localStorage
        sessionStorage.clear(); // Clears all data from sessionStorage

        // Navigate to the login page
        navigate('/');
    };


    // Navigate to profile page
    const goToProfile = () => {
        navigate('/profile', { state: { user,forms,users } });  // Pass the user data to profile page
    };

    useEffect(() => {
        const savedStatus = localStorage.getItem('status');
        if (savedStatus) {
            setStatus(savedStatus);
        }
    }, []);

    const [formData, setFormData] = useState({
        displayName: '',
        status: '',
        post: '',
        search: ''
    });

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleStatusUpdate = () => {
        setStatus(formData.status); // Update the status
        localStorage.setItem('status', formData.status); // Save status to localStorage
        setFormData(prevData => ({ ...prevData, status: '' })); // Clear the input field
    };

    const handleFriendChange = (e) => {
        setNewFriend(e.target.value);
    };

    const handleAddFriend = (e) => {
        e.preventDefault();

        if (newFriend.trim() !== '') {
            // Check if the friend already exists in the users list
            const friendExists = users.find(user => user.username.toLowerCase() === newFriend.toLowerCase());
            if (friendExists) {
                const newFriendObject = {
                    id: friendExists.id, // Arbitrary ID for new friend
                    username: newFriend, // Use the input value as the new friend's name
                    company: {
                        catchPhrase: friendExists.company.catchPhrase, // Arbitrary title for the new friend
                    },
                };

                setFriends([...friends, newFriendObject]); // Add the new friend to the list
                setNewFriend(''); // Clear the input field
            } else {
                alert('The name does not exist in the users list. Please enter a valid name.');
            }
        } else {
            alert('Please enter a friend name');
        }
    };


    const handleDeleteFriend = (friendName) => {
        const updatedFriends = friends.filter(friend => friend.username !== friendName);
        setFriends(updatedFriends); // Update the friends list
    }

    return (
        <div className="d-flex flex-column flex-lg-row h-100">
            {/* Sidebar */}
            <aside className="bg-white" style={{width: '250px', padding: '20px', borderRight: '1px solid #ccc'}}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <button className="btn btn-danger" style={{width: '45%'}} onClick={handleLogout}>
                        Log Out
                    </button>
                    <button className="btn btn-secondary" style={{width: '45%'}} onClick={goToProfile} aria-label='Profile Button'>
                        Profile
                    </button>
                </div>

                {/* User Info */}
                <div className="d-flex align-items-center mb-4">
                    <img
                        src={`https://images.pexels.com/photos/28824456/pexels-photo-28824456.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load`}
                        className="bg-secondary rounded-circle text-center" style={{width: '60px', height: '60px'}}
                    />
                </div>
                <div className="mb-3">
                    <h4 className="fw-bold">{(user?user.username: forms?.accountName)|| 'Guest'}</h4>
                    <p className="text-muted">{status}</p>
                </div>

                {/* Status Update */}
                <div className="form-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        placeholder="New Status"
                    />
                    <button
                        className="btn btn-primary w-100 mt-2"
                        onClick={handleStatusUpdate}>
                        Update
                    </button>
                </div>
                <div>
                    {friends.length > 0 &&
                        friends.map((friend, index) => (
                            <div key={index}>
                                {/**/}
                                <img
                                    src={`https://images.pexels.com/photos/12507496/pexels-photo-12507496.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load`}  // Fixed image for all friends
                                    className="bg-secondary rounded-circle text-center"
                                    style={{width: '60px', height: '60px'}}
                                    alt={friend?.username || 'Friend Avatar'}
                                />
                                <div className= "btn ms-auto ms-3"></div>
                                <button
                                    className="btn btn-danger ms-auto ms-3"
                                    onClick={() => handleDeleteFriend(friend.username)}>
                                    <i className="fas fa-trash-alt"></i>
                                </button>

                                <p className="fw-bold mb-1">{friend?.username || 'Unknown Friend'}</p>
                                <p className="text-muted">{friend?.company.catchPhrase}</p>

                            </div>
                        ))}
                </div>

                {/* Add Friend */
                }
                <div className="form-group mb-3">
                <label htmlFor="addFriend">Add Friend</label>
                    <input
                        type="text"
                        className="form-control"
                        id="addFriend"
                        name="addFriend"
                        placeholder="Enter username"
                        onChange={handleFriendChange}
                    />
                    <button className="btn btn-success w-100 mt-2" onClick={handleAddFriend} aria-label="Add Friend Button">Add</button>
                </div>
            </aside>

            {/* Main Content */
            }
            <Posts user={user} form={forms} friends={friends}/>
        </div>
    );
};

export default MainPage;
