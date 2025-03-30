import React, { useEffect, useState, useRef } from "react";
import './postList.css';
import axios from 'axios';
import './profile.css'; // 我们将创建这个文件用于 Profile 特定的样式

const Profile = (props) => {
    const BASE_URL = 'http://localhost:4000';
    const [profileData, setProfileData] = useState({
        headline: '',
        email: '',
        zipcode: '',
        phone: '',
        dob: '',
        avatar: ''
    });
    
    const [editing, setEditing] = useState({
        headline: false,
        email: false,
        zipcode: false,
        phone: false,
        dob: false,
        password: false
    });
    
    const [tempValues, setTempValues] = useState({
        headline: '',
        email: '',
        zipcode: '',
        phone: '',
        dob: '',
        password: '',
        confirmPassword: ''
    });
    
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);
    
    // 密码错误信息
    const [passwordError, setPasswordError] = useState('');

    // 获取用户资料
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // 获取用户状态
                const headlineResponse = await axios.get(`${BASE_URL}/profile/headline`, {
                    withCredentials: true
                });
                
                // 获取用户邮箱
                const emailResponse = await axios.get(`${BASE_URL}/profile/email`, {
                    withCredentials: true
                });
                
                // 获取用户邮编
                const zipcodeResponse = await axios.get(`${BASE_URL}/profile/zipcode`, {
                    withCredentials: true
                });
                
                // 获取用户电话
                const phoneResponse = await axios.get(`${BASE_URL}/profile/phone`, {
                    withCredentials: true
                });
                
                // 获取用户出生日期
                const dobResponse = await axios.get(`${BASE_URL}/profile/dob`, {
                    withCredentials: true
                });
                
                // 获取用户头像
                const avatarResponse = await axios.get(`${BASE_URL}/profile/avatar`, {
                    withCredentials: true
                });
                
                setProfileData({
                    headline: headlineResponse.data.headline || '',
                    email: emailResponse.data.email || '',
                    zipcode: zipcodeResponse.data.zipcode || '',
                    phone: phoneResponse.data.phone || '',
                    dob: dobResponse.data.dob || '',
                    avatar: avatarResponse.data.url || ''
                });
                
                setTempValues({
                    headline: headlineResponse.data.headline || '',
                    email: emailResponse.data.email || '',
                    zipcode: zipcodeResponse.data.zipcode || '',
                    phone: phoneResponse.data.phone || '',
                    dob: dobResponse.data.dob || '',
                    password: '',
                    confirmPassword: ''
                });
            } catch (error) {
                console.error('获取用户资料失败:', error);
                props.setFriendAlertMessage && props.setFriendAlertMessage('获取用户资料失败');
                props.setShowFriendAlert && props.setShowFriendAlert(true);
                setTimeout(() => props.setShowFriendAlert && props.setShowFriendAlert(false), 2000);
            }
        };
        
        fetchProfileData();
    }, [props.user]);
    
    // 开始编辑字段
    const handleEdit = (field) => {
        setEditing({...editing, [field]: true});
        setTempValues({...tempValues, [field]: profileData[field]});
        
        // 重置密码错误信息
        if (field === 'password') {
            setPasswordError('');
            setTempValues({...tempValues, password: '', confirmPassword: ''});
        }
    };
    
    // 取消编辑
    const handleCancel = (field) => {
        setEditing({...editing, [field]: false});
        
        // 重置密码错误信息
        if (field === 'password') {
            setPasswordError('');
        }
    };
    
    // 保存编辑结果
    const handleSave = async (field) => {
        try {
            // 特殊处理密码
            if (field === 'password') {
                if (tempValues.password !== tempValues.confirmPassword) {
                    setPasswordError('两次输入的密码不一致');
                    return;
                }
                
                if (tempValues.password.length < 6) {
                    setPasswordError('密码长度至少为6个字符');
                    return;
                }
                
                await axios.put(`${BASE_URL}/password`, {
                    password: tempValues.password
                }, { withCredentials: true });
                
                setEditing({...editing, password: false});
                setTempValues({...tempValues, password: '', confirmPassword: ''});
                
                props.setFriendAlertMessage && props.setFriendAlertMessage('密码更新成功！');
                props.setShowFriendAlert && props.setShowFriendAlert(true);
                setTimeout(() => props.setShowFriendAlert && props.setShowFriendAlert(false), 2000);
                
                return;
            }
            
            let response;
            
            switch (field) {
                case 'headline':
                    response = await axios.put(`${BASE_URL}/profile/headline`, {
                        headline: tempValues.headline
                    }, { withCredentials: true });
                    
                    // 更新主页面状态
                    if (props.updateMainStatus) {
                        props.updateMainStatus(tempValues.headline);
                    }
                    break;
                case 'email':
                    response = await axios.put(`${BASE_URL}/profile/email`, {
                        email: tempValues.email
                    }, { withCredentials: true });
                    break;
                case 'zipcode':
                    response = await axios.put(`${BASE_URL}/profile/zipcode`, {
                        zipcode: tempValues.zipcode
                    }, { withCredentials: true });
                    break;
                case 'phone':
                    response = await axios.put(`${BASE_URL}/profile/phone`, {
                        phone: tempValues.phone
                    }, { withCredentials: true });
                    break;
                case 'dob':
                    // DOB格式验证，确保格式为YYYY-MM-DD
                    const dobPattern = /^\d{4}-\d{2}-\d{2}$/;
                    if (!dobPattern.test(tempValues.dob)) {
                        props.setFriendAlertMessage && props.setFriendAlertMessage('出生日期格式无效，请使用YYYY-MM-DD格式');
                        props.setShowFriendAlert && props.setShowFriendAlert(true);
                        setTimeout(() => props.setShowFriendAlert && props.setShowFriendAlert(false), 2000);
                        return;
                    }
                    
                    response = await axios.put(`${BASE_URL}/profile/dob`, {
                        dob: tempValues.dob
                    }, { withCredentials: true });
                    break;
                default:
                    break;
            }
            
            // 更新成功后更新本地状态
            setProfileData({...profileData, [field]: tempValues[field]});
            setEditing({...editing, [field]: false});
            
            // 显示成功提示
            props.setFriendAlertMessage && props.setFriendAlertMessage('个人资料更新成功！');
            props.setShowFriendAlert && props.setShowFriendAlert(true);
            setTimeout(() => props.setShowFriendAlert && props.setShowFriendAlert(false), 2000);
        } catch (error) {
            console.error(`更新${field}失败:`, error);
            props.setFriendAlertMessage && props.setFriendAlertMessage(`更新${field}失败: ${error.response?.data?.message || '未知错误'}`);
            props.setShowFriendAlert && props.setShowFriendAlert(true);
            setTimeout(() => props.setShowFriendAlert && props.setShowFriendAlert(false), 2000);
        }
    };
    
    // 处理输入变化
    const handleInputChange = (field, value) => {
        setTempValues({...tempValues, [field]: value});
        
        // 如果是密码字段，重置错误信息
        if (field === 'password' || field === 'confirmPassword') {
            setPasswordError('');
        }
    };
    
    // 处理头像选择
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    
    // 上传头像
    const uploadAvatar = async () => {
        if (!avatarFile) return;
        
        const formData = new FormData();
        formData.append('file', avatarFile);
        formData.append('upload_preset', 'ricebook');
        formData.append('cloud_name', 'dgrmxcicw');
        const CLOUDINARY_CLOUD_NAME = 'dgrmxcicw';
        
        try {
            // 上传到 Cloudinary
            const uploadResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            const uploadData = await uploadResponse.json();
            const secureUrl = uploadData.secure_url;
            
            // 更新后端
            const response = await axios.put(`${BASE_URL}/profile/avatar`, {
                url: secureUrl
            }, { withCredentials: true });
            
            // 更新本地状态
            setProfileData({...profileData, avatar: secureUrl});
            setAvatarFile(null);
            setAvatarPreview(null);
            
            // 更新主页面的头像
            if (props.updateMainAvatar) {
                props.updateMainAvatar(secureUrl);
            }
            
            // 显示成功提示
            props.setFriendAlertMessage && props.setFriendAlertMessage('头像更新成功！');
            props.setShowFriendAlert && props.setShowFriendAlert(true);
            setTimeout(() => props.setShowFriendAlert && props.setShowFriendAlert(false), 2000);
        } catch (error) {
            console.error('更新头像失败:', error);
            props.setFriendAlertMessage && props.setFriendAlertMessage('更新头像失败');
            props.setShowFriendAlert && props.setShowFriendAlert(true);
            setTimeout(() => props.setShowFriendAlert && props.setShowFriendAlert(false), 2000);
        }
    };
    
    // 格式化日期显示
    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        try {
            const [year, month, day] = dateString.split('-');
            return `${year}年${month}月${day}日`;
        } catch (e) {
            return dateString;
        }
    };
    
    return (
        <div className="profile-container">
            <div className="profile-header">
                <button 
                    className="back-button"
                    onClick={() => props.setActiveComponent && props.setActiveComponent('Posts')}
                    title="返回所有帖子"
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                <h2>个人资料</h2>
            </div>
            
            <div className="profile-content-vertical">
                {/* 头像部分 */}
                <div className="profile-avatar-section">
                    <div className="profile-avatar">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="头像预览" />
                        ) : profileData.avatar ? (
                            <img src={profileData.avatar} alt={props.user} />
                        ) : (
                            <div className="avatar-placeholder">
                                {props.user ? props.user.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                        
                        <div className="avatar-overlay" onClick={() => fileInputRef.current.click()}>
                            <i className="fas fa-camera"></i>
                            <span>更换头像</span>
                        </div>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        style={{ display: 'none' }} 
                        accept="image/*" 
                    />
                    
                    {avatarPreview && (
                        <div className="avatar-actions">
                            <div className="edit-actions">
                                <button className="save-button" onClick={uploadAvatar}>
                                    <i className="fas fa-check"></i>
                                </button>
                                <button className="cancel-button" onClick={() => {
                                    setAvatarFile(null);
                                    setAvatarPreview(null);
                                    
                                    // 清空文件输入，确保下次可以选择同一文件
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <h3 className="profile-username">{props.user}</h3>
                </div>
                
                {/* 个人信息部分 */}
                <div className="profile-info-section">
                    <div className="profile-info-item">
                        <div className="info-label">个性签名</div>
                        {editing.headline ? (
                            <div className="info-edit">
                                <input 
                                    type="text" 
                                    value={tempValues.headline} 
                                    onChange={(e) => handleInputChange('headline', e.target.value)} 
                                />
                                <div className="edit-actions">
                                    <button className="save-button" onClick={() => handleSave('headline')}>
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button className="cancel-button" onClick={() => handleCancel('headline')}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="info-value">
                                <span>{profileData.headline || '添加个性签名'}</span>
                                <button className="edit-button" onClick={() => handleEdit('headline')}>
                                    <i className="fas fa-edit"></i>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="profile-info-item">
                        <div className="info-label">出生日期</div>
                        {editing.dob ? (
                            <div className="info-edit">
                                <input 
                                    type="date" 
                                    value={tempValues.dob} 
                                    onChange={(e) => handleInputChange('dob', e.target.value)} 
                                />
                                <div className="edit-actions">
                                    <button className="save-button" onClick={() => handleSave('dob')}>
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button className="cancel-button" onClick={() => handleCancel('dob')}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="info-value">
                                <span>{formatDate(profileData.dob) || '添加出生日期'}</span>
                                <button className="edit-button" onClick={() => handleEdit('dob')}>
                                    <i className="fas fa-edit"></i>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="profile-info-item">
                        <div className="info-label">邮箱地址</div>
                        {editing.email ? (
                            <div className="info-edit">
                                <input 
                                    type="email" 
                                    value={tempValues.email} 
                                    onChange={(e) => handleInputChange('email', e.target.value)} 
                                />
                                <div className="edit-actions">
                                    <button className="save-button" onClick={() => handleSave('email')}>
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button className="cancel-button" onClick={() => handleCancel('email')}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="info-value">
                                <span>{profileData.email || '添加邮箱地址'}</span>
                                <button className="edit-button" onClick={() => handleEdit('email')}>
                                    <i className="fas fa-edit"></i>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="profile-info-item">
                        <div className="info-label">邮政编码</div>
                        {editing.zipcode ? (
                            <div className="info-edit">
                                <input 
                                    type="text" 
                                    value={tempValues.zipcode} 
                                    onChange={(e) => handleInputChange('zipcode', e.target.value)} 
                                />
                                <div className="edit-actions">
                                    <button className="save-button" onClick={() => handleSave('zipcode')}>
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button className="cancel-button" onClick={() => handleCancel('zipcode')}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="info-value">
                                <span>{profileData.zipcode || '添加邮政编码'}</span>
                                <button className="edit-button" onClick={() => handleEdit('zipcode')}>
                                    <i className="fas fa-edit"></i>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="profile-info-item">
                        <div className="info-label">联系电话</div>
                        {editing.phone ? (
                            <div className="info-edit">
                                <input 
                                    type="tel" 
                                    value={tempValues.phone} 
                                    onChange={(e) => handleInputChange('phone', e.target.value)} 
                                />
                                <div className="edit-actions">
                                    <button className="save-button" onClick={() => handleSave('phone')}>
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button className="cancel-button" onClick={() => handleCancel('phone')}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="info-value">
                                <span>{profileData.phone || '添加联系电话'}</span>
                                <button className="edit-button" onClick={() => handleEdit('phone')}>
                                    <i className="fas fa-edit"></i>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="profile-info-item">
                        <div className="info-label">修改密码</div>
                        {editing.password ? (
                            <div className="password-edit-container">
                                <div className="password-inputs">
                                    <div className="password-input-group">
                                        <label>新密码</label>
                                        <input 
                                            type="password" 
                                            value={tempValues.password} 
                                            onChange={(e) => handleInputChange('password', e.target.value)} 
                                            placeholder="输入新密码"
                                        />
                                    </div>
                                    <div className="password-input-group">
                                        <label>确认密码</label>
                                        <input 
                                            type="password" 
                                            value={tempValues.confirmPassword} 
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)} 
                                            placeholder="再次输入新密码"
                                        />
                                    </div>
                                    {passwordError && <div className="password-error">{passwordError}</div>}
                                </div>
                                <div className="edit-actions">
                                    <button className="save-button" onClick={() => handleSave('password')}>
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button className="cancel-button" onClick={() => handleCancel('password')}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="info-value">
                                <span>••••••••</span>
                                <button className="edit-button" onClick={() => handleEdit('password')}>
                                    <i className="fas fa-edit"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 