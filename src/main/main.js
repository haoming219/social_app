import React, {useEffect, useState, useRef} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Posts from "./posts";
import MyPosts from "./myposts";
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';  // 添加在文件顶部
import Profile from './profile';

axios.defaults.withCredentials = true;

const BASE_URL = 'http://localhost:4000'; // 本地服务器地址
// const BASE_URL = 'https://social-app-ricebook-d655c5672da1.herokuapp.com'; // 注释掉原来的

const MainPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user || "";
    const users = location.state?.users;
    // store status from backend
    const [status, setStatus] = useState('');  // Default status
    const [newStatus, setNewStatus] = useState('');
    const [editingStatus, setEditingStatus] = useState(false);
    // store friends from backend
    const [newFriend, setNewFriend] = useState('');
    const [friends, setFriends] = useState([]);
    const [passFriends,setPassFriends] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const [sidePanelContent, setSidePanelContent] = useState('');
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [image, setImage] = useState(null);
    const [myPosts, setMyPosts] = useState([]);
    const [newFriendName, setNewFriendName] = useState('');
    const [showFriendAlert, setShowFriendAlert] = useState(false);
    const [friendAlertMessage, setFriendAlertMessage] = useState('');
    const [postAdded, setPostAdded] = useState(false);
    const [activeComponent, setActiveComponent] = useState('Posts'); // 默认显示 Posts

    const statusRef = useRef(null);
    const sidePanelRef = useRef(null);
    const modalRef = useRef(null);

    const modalBackdropStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1040
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (statusRef.current && !statusRef.current.contains(event.target)) {
                setEditingStatus(false);
            }
            if (sidePanelRef.current && !sidePanelRef.current.contains(event.target)) {
                setShowSidePanel(false);
            }
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [statusRef, sidePanelRef, modalRef]);

    // Logout handler
    const handleLogout = async () => {
        await axios.put(`${BASE_URL}/logout`);
        // Navigate to the login page
        navigate('/');
    };


    // Navigate to profile page
    const goToProfile = () => {
        navigate('/profile', { state: { user} });  // Pass the user data to profile page
    };

    const toggleModal = (content) => {
        if (modalContent === content && showModal) {
            setShowModal(false);
        } else {
            setModalContent(content);
            setShowModal(true);
            if (content === 'My Posts') {
                fetchMyPosts();
            }
        }
    };

    const toggleSidePanel = (content) => {
        if (content === 'Profile') {
            // 点击 Profile 按钮时切换主内容
            setActiveComponent(activeComponent === 'Profile' ? 'Posts' : 'Profile');
            setShowSidePanel(false); // 关闭侧边面板
        } else if (sidePanelContent === content && showSidePanel) {
            setShowSidePanel(false);
        } else {
            setSidePanelContent(content);
            setShowSidePanel(true);
        }
    };

    useEffect(() => {
        const fetchFriendsAndStatuses = async () => {
            try {
                // Step 1: Fetch the list of friends
                const friendsResponse = await axios.get(`${BASE_URL}/following/following/`, {
                    withCredentials: true,
                });

                const friends = friendsResponse.data.friends;
                setPassFriends(friends);
                // console.log(friends);

                // Step 2: Fetch the status for each friend in parallel
                const statuses = await Promise.all(
                    friends.map(async (friendName) => {
                        try {
                            const statusResponse = await axios.get(
                                `${BASE_URL}/profile/headline/${friendName}`,
                                { withCredentials: true }
                            );
                            const avatarResponse = await axios.get(
                                `${BASE_URL}/profile/avatar/${friendName}`,
                                { withCredentials: true }
                            );

                            return {
                                name: friendName,
                                status: statusResponse.data.headline, // Assuming `headline` is the key
                                avatar: avatarResponse.data.url // Provide a default if no avatar
                            };
                        } catch (error) {
                            console.error(`Error fetching status for ${friendName}:`, error.message);
                            return { name: friendName, status: "Error fetching status" };
                        }
                    })
                );

                // Step 3: Update the state with combined data
                setFriends(statuses);
            } catch (error) {
                console.error("Error fetching friends or statuses:", error.message);
            }
        };

        fetchFriendsAndStatuses();
    }, []);


    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/profile/headline`, {
                    withCredentials: true, // Include cookies if needed for authentication
                });
                setStatus(response.data.headline); // Assuming the backend sends `status` in the response body
                // console.log(status);
            } catch (error) {
                console.error('Error fetching status:', error.message);
            }
        };
        const fetchAvatar = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/profile/avatar/`, {
                    withCredentials: true, // Include cookies if needed for authentication
                });
                console.log(response.data.url);
                setFormData(prevState => ({
                    ...prevState,
                    avatar: response.data.url // Store the file object directly
                })); // Assuming the backend sends `status` in the response body
                // console.log(status);
            } catch (error) {
                console.error('Error fetching status:', error.message);
            }
        };

        fetchStatus();
        fetchAvatar();
    }, []);

    const [formData, setFormData] = useState({
        displayName: '',
        status: '',
        post: '',
        avatar: ''
    });

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleStatusUpdate = async () => {
        try {
            const response = await axios.put(`${BASE_URL}/profile/headline`,
                {headline: newStatus},
                {withCredentials: true}
            );
            setStatus(response.data.headline);
            setFriendAlertMessage('Status updated successfully!');
            setShowFriendAlert(true);
            setTimeout(() => {
                setShowFriendAlert(false);
            }, 2000);
            setEditingStatus(false);
        } catch (error) {
            console.error('Error updating status message:', error.response?.data || error.message);
            // Handle error (e.g., show error message to user)
            setNewFriend('');
            setFriendAlertMessage(error.response?.data?.message || 'Failed to update status message');
            setShowFriendAlert(true);
            setTimeout(() => {
                setShowFriendAlert(false);
            }, 2000);
        }
    };

    const handleFriendChange = (e) => {
        setNewFriend(e.target.value);
    };

    const handleAddFriend = async (e) => {
        e.preventDefault();

        if (newFriend.trim() !== '') {
            // Check if the friend already exists in the users list
            try {
                const response = await axios.put(
                    `${BASE_URL}/following/following/${newFriend}`,
                    {},
                    { withCredentials: true }
                );

                // Step 2: Fetch the status of the newly added friend
                const statusResponse = await axios.get(
                    `${BASE_URL}/profile/headline/${newFriend}`,
                    { withCredentials: true }
                );

                const avatarResponse = await axios.get(
                    `${BASE_URL}/profile/avatar/${newFriend}`,
                    { withCredentials: true }
                );

                // Step 3: Update the friends state by appending the new friend with their status
                setFriends((prevFriends) => [
                    ...prevFriends,
                    { name: newFriend, status: statusResponse.data.headline, avatar: avatarResponse.data.url }
                ]);
                setPassFriends((prevFriends) => [
                    ...prevFriends,
                    newFriend
                ]);

                setNewFriend('');
                setFriendAlertMessage('Follow successfully!');
                setShowFriendAlert(true);
                setTimeout(() => {
                    setShowFriendAlert(false);
                }, 2000);

            } catch (error) {
                console.error('Error updating status message:', error.response?.data || error.message);
                // Handle error (e.g., show error message to user)
                setNewFriend('');
                setFriendAlertMessage(error.response?.data?.message || 'Failed to update status message');
                setShowFriendAlert(true);
                setTimeout(() => {
                    setShowFriendAlert(false);
                }, 2000);
            }
        }
    else {
            setFriendAlertMessage('Please enter a friend name');
            setShowFriendAlert(true);
            setTimeout(() => {
                setShowFriendAlert(false);
            }, 2000);
            
        }
    };


    const handleDeleteFriend = async (friendToDelete) => {
        try {
            // Step 1: Delete the friend on the backend
            await axios.delete(`${BASE_URL}/following/${friendToDelete}`, {
                withCredentials: true,
            });

            // Step 2: Update the friends state by filtering out the deleted friend
            setFriends((prevFriends) =>
                prevFriends.filter((friend) => friend.name !== friendToDelete)
            );

            setPassFriends((prevFriends) =>
                prevFriends.filter((friend) => friend.name !== friendToDelete)
            );

            setFriendAlertMessage('Unfollow successfully!');
            setShowFriendAlert(true);
            setTimeout(() => {
                setShowFriendAlert(false);
            }, 2000);
        } catch (error) {
            console.error("Error deleting friend:", error.response?.data || error.message);
            setFriendAlertMessage(error.response?.data?.message || "Failed to delete friend");
            setShowFriendAlert(true);
            setTimeout(() => {
                setShowFriendAlert(false);
            }, 2000);
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
    };

    const uploadToCloudinary = async () => {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'ricebook');
        formData.append('cloud_name', 'dgrmxcicw');
        const CLOUDINARY_CLOUD_NAME = 'dgrmxcicw';

        try {
            let secureUrl = '';
            if(image){
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );
                const data = await response.json();
                secureUrl = data.secure_url;
            }

            const postToBackend = async (secureUrl) => {
                try {
                    const response = await axios.post(`${BASE_URL}/articles/article`, {
                        title: postTitle,
                        text: postBody,
                        url: secureUrl,
                    },
                    {
                        withCredentials: true
                    });

                    if (response.status === 200) {
                        // 清除表单
                        setPostTitle('');
                        setPostBody('');
                        setImage(null);
                        setShowModal(false);
                        
                        // 设置帖子添加成功状态，触发重新获取帖子
                        setPostAdded(true);
                        
                        // 使用react-toastify或自定义通知显示成功消息
                        setFriendAlertMessage('帖子发布成功！');
                        setShowFriendAlert(true);
                        setTimeout(() => {
                            setShowFriendAlert(false);
                        }, 2000);
                    }
                } catch (error) {
                    console.error('Error saving post:', error);
                    setFriendAlertMessage('发布帖子失败！');
                    setShowFriendAlert(true);
                    setTimeout(() => {
                        setShowFriendAlert(false);
                    }, 2000);
                }
            };
            await postToBackend(secureUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            setFriendAlertMessage('上传图片失败！');
            setShowFriendAlert(true);
            setTimeout(() => {
                setShowFriendAlert(false);
            }, 2000);
        }
    };

    const handleClear = () => {
        setPostTitle('');
        setPostBody('');
        
        // 使用null而不是undefined来重置图片
        setImage(null);
        
        // 清空文件输入
        const fileInput = document.getElementById('imageInput');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const fetchMyPosts = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/articles/articles`, {
                params: {
                    author: user
                },
                withCredentials: true
            });
            setMyPosts(response.data.articles);
        } catch (error) {
            console.error('Error fetching my posts:', error);
        }
    };

    const toggleMyPosts = () => {
        if (activeComponent === 'MyPosts') {
            setActiveComponent('Posts');
        } else {
            setActiveComponent('MyPosts');
        }
    };

    const updateMainStatus = (newStatus) => {
        setStatus(newStatus);
    };

    const updateMainAvatar = (newAvatarUrl) => {
        setFormData(prevState => ({
            ...prevState,
            avatar: newAvatarUrl
        }));
    };

    return (
        <div>
            {/* Top Bar */}
            <div
                className="d-flex justify-content-between align-items-center bg-dark text-white px-4 py-3 position-sticky top-0 shadow-sm"
                style={{ zIndex: 1000 }}
            >
                {/* Branding */}
                <div className="d-flex align-items-center">
                    <img
                        src="https://cdn3.iconfinder.com/data/icons/letters-and-numbers-1/32/letter_R_blue-256.png"
                        alt="Logo"
                        className="me-3"
                        style={{ width: '40px', height: '40px' }}
                    />
                    <h1 className="h5 m-0 fw-bold text-light">Ricebook</h1>
                </div>
            </div>

            <div className="d-flex flex-column flex-lg-row h-100">
                {/* Sidebar */}
                <aside className="sidebar">
                    {/* User Info */}
                    <div className="user-info">
                        <img
                            src={formData.avatar}
                            alt="User Avatar"
                            className="user-avatar"
                        />
                        <h4 className="user-name">{user || 'Guest'}</h4>
                    </div>

                    {/* Status */}
                    <div className="status-container" ref={statusRef}>
                        {showFriendAlert && (
                                        <div className="friend-alert">
                                            {friendAlertMessage}
                                        </div>
                                    )}
                        {editingStatus ? (
                            <div className="d-flex align-items-center">
                                <input
                                    type="text"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="status-input"
                                />
                                <button 
                                    className="edit-button ms-2"
                                    onClick={handleStatusUpdate}
                                >
                                    <i className="fas fa-check"></i>
                                </button>
                                
                            </div>
                        ) : (
                            <div className="d-flex align-items-center justify-content-between">
                                <span className="text-muted">{status}</span>
                                <button 
                                    className="edit-button"
                                    onClick={() => { setEditingStatus(true); setNewStatus(status); }}
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="d-flex flex-column">
                        <button className="sidebar-button" onClick={() => toggleSidePanel('Friends')}>
                            <i className="fas fa-users me-2"></i> Friends
                        </button>
                        <button className="sidebar-button" onClick={() => toggleModal('Add Post')}>
                            <i className="fas fa-plus-circle me-2"></i> Add Post
                        </button>
                        <button 
                            className={`sidebar-button ${activeComponent === 'MyPosts' ? 'active' : ''}`}
                            onClick={toggleMyPosts}
                        >
                            <i className="fas fa-book me-2"></i> My Posts
                        </button>
                        <button className="sidebar-button" onClick={() => toggleSidePanel('Profile')}>
                            <i className="fas fa-user me-2"></i> Profile
                        </button>
                    </div>

                    {/* Logout Button */}
                    <button className="logout-button" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </aside>

                {/* Main Content */}
                <div style={{ marginLeft: '250px', flex: 1 }}>
                    {activeComponent === 'Posts' ? (
                        <Posts 
                            user={user} 
                            friends={passFriends} 
                            postAdded={postAdded} 
                            setPostAdded={setPostAdded}
                            setFriendAlertMessage={setFriendAlertMessage}
                            setShowFriendAlert={setShowFriendAlert}
                        />
                    ) : activeComponent === 'MyPosts' ? (
                        <MyPosts 
                            user={user}
                            setFriendAlertMessage={setFriendAlertMessage}
                            setShowFriendAlert={setShowFriendAlert}
                            setActiveComponent={setActiveComponent}
                            toggleModal={toggleModal}
                        />
                    ) : activeComponent === 'Profile' && (
                        <Profile
                            user={user}
                            setFriendAlertMessage={setFriendAlertMessage}
                            setShowFriendAlert={setShowFriendAlert}
                            setActiveComponent={setActiveComponent}
                            updateMainStatus={updateMainStatus}
                            updateMainAvatar={updateMainAvatar}
                        />
                    )}
                </div>

                {/* Side Panel */}
                {showSidePanel && (
                    <div ref={sidePanelRef} className="side-panel bg-light shadow" 
                         style={{ position: 'fixed', right: 0, top: '80px', height: '100%', width: '300px', zIndex: 1050, overflowY: 'auto' }}>
                        <div className="p-3">
                            {sidePanelContent === 'Friends' && (
                                <div className="friends-panel">
                                    {/* Close Button - 放在左上角 */}
                                    <button 
                                        className="panel-close-button"
                                        onClick={() => setShowSidePanel(false)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>

                                    {showFriendAlert && (
                                        <div className="friend-alert">
                                            {friendAlertMessage}
                                        </div>
                                    )}

                                    {/* Add Friend Section */}
                                    <div className="add-friend-section">
                                        <div className="search-input-group">
                                            <input
                                                type="text"
                                                className="search-input"
                                                value={newFriendName}
                                                onChange={(e) => {
                                                    setNewFriendName(e.target.value);
                                                    setNewFriend(e.target.value);
                                                }}
                                                placeholder="Add new friend..."
                                            />
                                            <button 
                                                className="search-button"
                                                onClick={(e) => {
                                                    handleAddFriend(e);
                                                    setNewFriendName('');
                                                }}
                                            >
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Friends List Section */}
                                    <div className="friends-list-container">
                                        {friends.map((friend, index) => (
                                            <div key={index} className="friend-item">
                                                <div className="friend-info">
                                                    <div className="friend-avatar">
                                                        {friend.avatar ? (
                                                            <img 
                                                                src={friend.avatar} 
                                                                alt={friend.name} 
                                                                className="avatar-image"
                                                            />
                                                        ) : (
                                                            <div className="avatar-placeholder">
                                                                {friend.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="friend-details">
                                                        <div className="friend-name">{friend.name}</div>
                                                        <div className="friend-status">{friend.status}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="unfriend-button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDeleteFriend(friend.name);
                                                    }}
                                                >
                                                    Unfollow
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <>
                        <div 
                            className="modal-backdrop show" 
                            onClick={() => setShowModal(false)}
                            style={modalBackdropStyle}
                        ></div>
                        <div className="modal show d-block" tabIndex="-1" role="dialog">
                            <div className="modal-dialog modal-lg" role="document">
                                <div className="modal-content" ref={modalRef}>
                                    <button 
                                        type="button" 
                                        className="modal-close-button" 
                                        onClick={() => setShowModal(false)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                    
                                    {modalContent === 'Add Post' ? (
                                        // Add Post 内容
                                        <>
                                            <div className="modal-body create-post-modal">
                                                <div className="post-creation-header">
                                                    <h6>创建新帖子</h6>
                                                </div>
                                                
                                                <div className="post-creation-container">
                                                    {/* 图片上传部分 */}
                                                    <div className="image-upload-area">
                                                        {image ? (
                                                            <div className="preview-container">
                                                                <img 
                                                                    src={URL.createObjectURL(image)} 
                                                                    alt="Preview" 
                                                                    className="image-preview"
                                                                />
                                                                <button 
                                                                    className="remove-image-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // 阻止事件冒泡
                                                                        setImage(null);
                                                                    }}
                                                                    type="button"
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <label htmlFor="imageInput" className="upload-placeholder">
                                                                <i className="far fa-image"></i>
                                                                <p>点击上传图片</p>
                                                                <span className="upload-info">支持 JPG, PNG 格式</span>
                                                            </label>
                                                        )}
                                                        <input
                                                            type="file"
                                                            id="imageInput"
                                                            name="image"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                            className="image-input"
                                                            onClick={(e) => {
                                                                // 如果已经有图片，点击区域会触发文件选择
                                                                // 如果使用了标签，这里其实不需要特殊处理
                                                                if (image) {
                                                                    e.stopPropagation();
                                                                }
                                                            }}
                                                        />
                                                    </div>

                                                    {/* 文本输入部分 */}
                                                    <div className="post-text-inputs">
                                                        <div className="post-author-info">
                                                            <div className="post-avatar">
                                                                {formData.avatar ? (
                                                                    <img src={formData.avatar} alt={user} />
                                                                ) : (
                                                                    <div className="post-avatar-placeholder">
                                                                        {user.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="post-username">{user}</span>
                                                        </div>
                                                        
                                                        <input
                                                            className="post-title-input"
                                                            name="postTitle"
                                                            value={postTitle}
                                                            onChange={(e) => setPostTitle(e.target.value)}
                                                            placeholder="输入标题..."
                                                        />
                                                        
                                                        <textarea
                                                            className="post-content-input"
                                                            name="postBody"
                                                            value={postBody}
                                                            onChange={(e) => setPostBody(e.target.value)}
                                                            placeholder="分享你的想法..."
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="modal-footer post-creation-footer">
                                                <button 
                                                    className="clear-button"
                                                    onClick={handleClear}
                                                    type="button"
                                                >
                                                    清除
                                                </button>
                                                <button 
                                                    className="post-button"
                                                    onClick={uploadToCloudinary}
                                                    disabled={!postTitle.trim() && !postBody.trim()}
                                                    type="button"
                                                >
                                                    发布
                                                </button>
                                            </div>
                                        </>
                                    ) : modalContent === 'My Posts' ? (
                                        // My Posts 的内容
                                        <>
                                            <div className="modal-body">
                                                <div className="my-posts-container">
                                                    <h6>Your Posts</h6>
                                                    {myPosts.map((post) => (
                                                        <div key={post._id} className="post-item mb-3 p-3 border rounded">
                                                            <h6>{post.title}</h6>
                                                            <p>{post.text}</p>
                                                            {post.url && <img src={post.url} alt="Post" style={{maxWidth: '200px'}} />}
                                                            <small className="text-muted">Posted on: {new Date(post.date).toLocaleDateString()}</small>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                                    Close
                                                </button>
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MainPage;
