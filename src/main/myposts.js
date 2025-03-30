import React, {useEffect, useRef, useState} from "react";
import './postList.css'
import axios from 'axios';
import './search.css';
import ShowAllPostsButton from './ShowAllPostsButton';

const MyPosts= (props) =>{
    const [posts, setPosts] = useState([]);  // To store fetched users
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [postTitle, setPostTitle] = useState(''); // Title input state
    const [postBody, setPostBody] = useState('');
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("text");
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(10);
    const BASE_URL = 'http://localhost:4000'; // 本地服务器地址
    // const BASE_URL = 'https://social-app-ricebook-d655c5672da1.herokuapp.com'; // 注释掉原来的
    const [likedPosts, setLikedPosts] = useState({}); // 存储每篇帖子的点赞状态

    const [image, setImage] = useState(null);

    const [textInput, setTextInput] = useState('');
    const [commentInput, setCommentInput] = useState('');
    const [currentPosts, setCurrentPosts] = useState([]);
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const totalPages = Math.ceil(displayedPosts.length / postsPerPage);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchRef = useRef(null);
    const [showNoResults, setShowNoResults] = useState(false);

    // 添加评论相关状态
    const [showComments, setShowComments] = useState(null); // 存储当前显示评论的帖子ID
    const commentModalRef = useRef(null); // 评论模态框的ref
    const [newComment, setNewComment] = useState(''); // 新评论文本

    // 添加状态来跟踪正在编辑的评论
    const [editingCommentId, setEditingCommentId] = useState(null); // 存储正在编辑的评论的索引
    const [editCommentText, setEditCommentText] = useState(''); // 存储编辑后的评论内容

    
    // Handle clearing the text input
    const handleClear = () => {
        setPostTitle('');
        setPostBody('');
    };

    useEffect(() => {
        const indexOfLastPost = currentPage * postsPerPage;
        const indexOfFirstPost = indexOfLastPost - postsPerPage;
        setCurrentPosts(displayedPosts.slice(indexOfFirstPost, indexOfLastPost));
    }, [displayedPosts, currentPage, postsPerPage]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // 只获取当前用户的帖子，不包括关注的用户
                const response = await axios.get(`${BASE_URL}/articles/articles/`, {
                    params: {
                        author: props.user  // 只查询当前用户的帖子
                    },
                    withCredentials: true,
                });

                // Transform posts to include additional information
                const transformedPosts = await Promise.all(
                    response.data.articles.map(async (post) => {
                      const author = post.author || 'Unknown';
                      let avatarUrl = '';
                  
                      try {
                        // 请求用户头像
                        const avatarResponse = await axios.get(
                          `${BASE_URL}/profile/avatar/${author}`,
                          { withCredentials: true }
                        );
                        // 假设返回数据中包含 avatarUrl 字段
                        avatarUrl = avatarResponse.data.url;
                
                      } catch (error) {
                        console.error(`获取用户 ${author} 头像失败:`, error);
                        // 可以设置一个默认头像
                        avatarUrl = 'default-avatar.png';
                      }

                      // 获取点赞状态
                      await fetchLikeStatus(post._id);
                  
                      return {
                        ...post,
                        id: post._id,
                        author,
                        timestamp: new Date(post.date).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }),
                        imageUrl: post.image,
                        avatar: avatarUrl, // 添加头像
                        comments: post.comments
                      };
                    })
                  );

                // Sort posts by most recent first
                const sortedPosts = transformedPosts.sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );

                // Update posts and displayedPosts
                setPosts(sortedPosts);
                setDisplayedPosts(sortedPosts); // Ensure displayedPosts is set to all posts initially

                // Reset to first page
                setCurrentPage(1);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            }
        };

        // 只要有用户信息就获取帖子
        if (props.user) {
            fetchPosts();
        }
    }, [props.user]); // 依赖项改为仅 props.user，不需要 props.friends

    // Pagination handlers
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    // Handle search type change
    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
    };

    // Handle search submission
    const handleSearchSubmit = () => {
        let filteredPosts;
        if (searchType === "text") {
            filteredPosts = posts.filter(post => 
                post.title.toLowerCase().includes(searchQuery) || 
                post.text.toLowerCase().includes(searchQuery)
            );
        } else if (searchType === "author") {
            filteredPosts = posts.filter(post => 
                post.author.toLowerCase().includes(searchQuery)
            );
        }

        if (filteredPosts.length === 0) {
            setShowNoResults(true);
            setTimeout(() => {
                setShowNoResults(false);
            }, 2000);
            return;
        }

        setDisplayedPosts(filteredPosts);
        setCurrentPage(1); // Reset to first page
        setIsSearchExpanded(false);
    };

    // 添加回车键搜索处理函数
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    const handleUpdatePost = async (postId, newText) => {
        try {
            const response = await axios.put(`${BASE_URL}/articles/articles/${postId}`, {
                text: newText,
                // No commentId provided for post update
                commentId: null
            }, {
                withCredentials: true,
            });

            // Update local state with the response from the server
            setDisplayedPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, image: response.data.image,text:response.data.text } // Assuming `response.data.image` is the new image URL
                        : post
                )
            );


            // Clear the input after updating
            setTextInput('');
        } catch (error) {
            alert("You are not authorized to edit this post.");
            console.error("Error updating post:", error);
            // Optional: Add error handling (show error message to user)
            // toast.error(error.response?.data?.error || "Failed to update post");
        }
    };

    const handleAddComment = async (postId, commentText) => {
        try {
            const response = await axios.put(`${BASE_URL}/articles/articles/${postId}`, {
                text: commentText,
                commentId: -1 // Specific value to trigger comment addition
            }, {
                withCredentials: true,
            });

            // Update local state with the response from the server
            setDisplayedPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, image: response.data.image } // Assuming `response.data.image` is the new image URL
                        : post
                )
            );


            // Clear the input after adding comment
            setTextInput('');
        } catch (error) {
            alert(error);
            console.error("Error adding comment:", error);
            // Optional: Add error handling (show error message to user)
            // toast.error(error.response?.data?.error || "Failed to add comment");
        }
    };

    const handleEditComment = async (postId, commentText) => {
        try {
            const response = await axios.put(`${BASE_URL}/articles/articles/${postId}`, {
                text: commentText,
                commentId: 1 // Specific value to trigger comment addition
            }, {
                withCredentials: true,
            });

            // Update local state with the response from the server
            setDisplayedPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, comments: response.data.comments } // Assuming `response.data.image` is the new image URL
                        : post
                )
            );


            // Clear the input after adding comment
            setCommentInput('');
        } catch (error) {
            alert(error);
            console.error("Error adding comment:", error);
            // Optional: Add error handling (show error message to user)
            // toast.error(error.response?.data?.error || "Failed to add comment");
        }
    };

    // 添加点击外部关闭搜索框的效果
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 在 clearSearch 函数中重置 displayedPosts
    const clearSearch = () => {
        setSearchQuery('');
        setDisplayedPosts(posts); // Reset displayedPosts to all posts
        setCurrentPage(1); // Reset to first page
    };

    // 处理点赞功能
    const handleLike = async (postId) => {
        try {
            if (likedPosts[postId]) {
                // 如果已经点赞，则取消点赞
                await axios.delete(`${BASE_URL}/articles/articles/${postId}/${props.user}/likes`, {
                    withCredentials: true
                });
                
                // 更新本地状态
                setLikedPosts(prev => ({
                    ...prev,
                    [postId]: false
                }));
            } else {
                // 如果未点赞，则添加点赞
                await axios.post(`${BASE_URL}/articles/articles/${postId}/likes`, {
                    name: props.user
                }, {
                    withCredentials: true
                });
                
                // 更新本地状态
                setLikedPosts(prev => ({
                    ...prev,
                    [postId]: true
                }));
            }
        } catch (error) {
            console.error("点赞/取消点赞失败:", error);
        }
    };

    // 获取点赞状态
    const fetchLikeStatus = async (postId) => {
        try {
            const response = await axios.get(`${BASE_URL}/articles/articles/${postId}/likes`, {
                withCredentials: true
            });
            
            // 检查当前用户是否点赞了该帖子
            const isLiked = response.data.likes.includes(props.user);
            
            // 更新本地状态
            setLikedPosts(prev => ({
                ...prev,
                [postId]: isLiked
            }));
        } catch (error) {
            console.error(`获取帖子 ${postId} 的点赞状态失败:`, error);
        }
    };

    // 显示评论模态框
    const handleShowComments = (postId) => {
        setShowComments(postId);
        setNewComment(''); // 清空新评论输入框
    };

    // 关闭评论模态框
    const handleCloseComments = () => {
        setShowComments(null);
    };

    // 处理点击评论模态框以外区域关闭模态框
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (commentModalRef.current && !commentModalRef.current.contains(event.target)) {
                handleCloseComments();
            }
        };

        if (showComments) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showComments]);

    // 提交新评论
    const handleSubmitComment = async (postId) => {
        if (!newComment.trim()) return; // 不提交空评论
        
        try {
            const response = await axios.put(`${BASE_URL}/articles/articles/${postId}`, {
                text: newComment,
                commentId: -1 // 表示添加新评论
            }, {
                withCredentials: true
            });
            
            // 更新本地状态
            setDisplayedPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, comments: response.data.comments }
                        : post
                )
            );
            
            setNewComment(''); // 清空输入框
        } catch (error) {
            console.error("提交评论失败:", error);
        }
    };

    // 添加删除评论的函数
    const handleDeleteComment = async (postId, commentIndex) => {
        try {
            const response = await axios.delete(
                `${BASE_URL}/articles/articles/${postId}/comments/${commentIndex}`,
                { withCredentials: true }
            );
            
            // 更新本地状态，移除已删除的评论
            setDisplayedPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, comments: response.data.comments }
                        : post
                )
            );
        } catch (error) {
            console.error("删除评论失败:", error);
            alert(error.response?.data?.error || "删除评论失败");
        }
    };

    // 开始编辑评论
    const handleStartEditComment = (commentIndex, commentText) => {
        setEditingCommentId(commentIndex);
        setEditCommentText(commentText);
    };

    // 取消编辑评论
    const handleCancelEditComment = () => {
        setEditingCommentId(null);
        setEditCommentText('');
    };

    // 提交编辑后的评论
    const handleSubmitEditComment = async (postId, commentIndex) => {
        if (!editCommentText.trim()) return;
        
        try {
            // 使用现有的 API 端点更新评论
            const response = await axios.put(
                `${BASE_URL}/articles/articles/${postId}`, 
                {
                    commentId: 1, // 使用评论索引作为 commentId
                    text: editCommentText
                },
                { withCredentials: true }
            );
            
            // 更新本地状态
            setDisplayedPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? { ...post, comments: response.data.comments }
                        : post
                )
            );
            
            // 重置编辑状态
            setEditingCommentId(null);
            setEditCommentText('');
        } catch (error) {
            console.error("编辑评论失败:", error);
            alert(error.response?.data?.error || "编辑评论失败");
        }
    };

    // 监听postAdded状态变化
    useEffect(() => {
        if (props.postAdded) {
            // 重新获取帖子数据
            const fetchPosts = async () => {
                try {
                    // 只获取当前用户的帖子
                    const response = await axios.get(`${BASE_URL}/articles/articles/`, {
                        params: {
                            author: props.user // 只查询当前用户的帖子
                        },
                        withCredentials: true,
                    });

                    // Transform posts to include additional information
                    const transformedPosts = await Promise.all(
                        response.data.articles.map(async (post) => {
                          const author = post.author || 'Unknown';
                          let avatarUrl = '';
                      
                          try {
                            // 请求用户头像
                            const avatarResponse = await axios.get(
                              `${BASE_URL}/profile/avatar/${author}`,
                              { withCredentials: true }
                            );
                            // 假设返回数据中包含 avatarUrl 字段
                            avatarUrl = avatarResponse.data.url;
                
                          } catch (error) {
                            console.error(`获取用户 ${author} 头像失败:`, error);
                            // 可以设置一个默认头像
                            avatarUrl = 'default-avatar.png';
                          }

                          // 获取点赞状态
                          await fetchLikeStatus(post._id);
                      
                          return {
                            ...post,
                            id: post._id,
                            author,
                            timestamp: new Date(post.date).toLocaleString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }),
                            imageUrl: post.image,
                            avatar: avatarUrl, // 添加头像
                            comments: post.comments
                          };
                        })
                      );

                    // Sort posts by most recent first
                    const sortedPosts = transformedPosts.sort((a, b) =>
                        new Date(b.timestamp) - new Date(a.timestamp)
                    );

                    // Update posts and displayedPosts
                    setPosts(sortedPosts);
                    setDisplayedPosts(sortedPosts);
                    setCurrentPage(1);
                    
                    // 重置postAdded状态
                    props.setPostAdded(false);
                } catch (error) {
                    console.error('Failed to fetch posts:', error);
                }
            };

            fetchPosts();
        }
    }, [props.postAdded, props.user]);

    // 添加删除帖子的函数
    const handleDeletePost = async (postId) => {
        // 确认是否真的要删除
        if (!window.confirm('确定要删除这篇帖子吗？此操作不可撤销。')) {
            return;
        }
        
        try {
            await axios.delete(`${BASE_URL}/articles/articles/${postId}`, {
                withCredentials: true
            });
            
            // 更新本地状态，移除已删除的帖子
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            setDisplayedPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            
            // 显示成功消息
            alert('帖子已成功删除');
        } catch (error) {
            console.error("删除帖子失败:", error);
            alert(error.response?.data?.error || "删除帖子失败");
        }
    };

    return <main className="flex-1 p-4">
        {/* 页面标题和返回按钮 */}
        <div className="my-posts-header">
            <button 
                className="back-button"
                onClick={() => props.setActiveComponent && props.setActiveComponent('Posts')}
                title="返回所有帖子"
            >
                <i className="fas fa-arrow-left"></i>
            </button>
            <h2>我的帖子</h2>
        </div>
        
        {/* Search Bar */}
        <div className="search-container" ref={searchRef}>
            <div className="d-flex align-items-center">
                <button 
                    className="search-icon"
                    onClick={() => setIsSearchExpanded(true)}
                >
                    <i className="fas fa-search fa-lg"></i>
                </button>
                {displayedPosts.length !== posts.length && (
                    <ShowAllPostsButton onClick={clearSearch} />
                )}
            </div>
            {isSearchExpanded && (
                <div className="search-expanded">
                    <div className="search-input-group">
                        <select
                            className="search-type-select"
                            value={searchType}
                            onChange={handleSearchTypeChange}
                        >
                            <option value="text">By Text</option>
                            <option value="author">By Author</option>
                        </select>
                        <input
                            type="text"
                            className="search-input"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyPress={handleKeyPress}
                            placeholder={`Search by ${searchType}...`}
                            autoFocus
                        />
                        <button
                            className="search-button"
                            onClick={() => {
                                handleSearchSubmit();
                                setIsSearchExpanded(false);
                            }}
                        >
                            Search
                        </button>
                    </div>
                </div>
            )}
        </div>
        
        {/* 帖子列表 */}
        {currentPosts.length > 0 ? (
            <div className="posts-grid">
                {currentPosts.map((post, index) => (
                    <div key={post.id} className={`post-card ${!post.imageUrl ? 'text-only-post' : ''}`}>
                        <div className="post-header">
                            <div className="post-user-info">
                                <div className="post-avatar">
                                    {post.avatar ? (
                                        <img src={post.avatar} alt={post.author} />
                                    ) : (
                                        <div className="post-avatar-placeholder">
                                            {post.author.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <span className="post-username">{post.author}</span>
                            </div>
                            <div className="post-actions-menu">
                                <div className="post-timestamp">{post.timestamp}</div>
                                {post.author === props.user && (
                                    <button 
                                        className="post-delete-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePost(post.id);
                                        }}
                                        title="删除帖子"
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {post.imageUrl ? (
                            <div className="post-image-container">
                                <img
                                    src={post.imageUrl}
                                    alt={`Post ${index + 1}`}
                                    className="post-image"
                                />
                            </div>
                        ) : (
                            <div className="text-post-container">
                                <h3 className="post-title-featured">{post.title}</h3>
                            </div>
                        )}
                        
                        <div className="post-details">
                            {post.imageUrl && <h3 className="post-title">{post.title}</h3>}
                            <p className="post-body">{post.text}</p>
                        </div>

                        {/* 点赞和评论按钮 */}
                        <div className="post-actions">
                            <button 
                                className={`post-action-button like-button ${likedPosts[post.id] ? 'active' : ''}`}
                                onClick={() => handleLike(post.id)}
                            >
                                <i className={likedPosts[post.id] ? 'fas fa-heart' : 'far fa-heart'}></i>
                            </button>
                            <button 
                                className="post-action-button comment-button"
                                onClick={() => handleShowComments(post.id)}
                            >
                                <i className="far fa-comment"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="no-posts-message">
                <i className="far fa-frown"></i>
                <p>你还没有发布任何帖子</p>
                <button 
                    className="create-post-button"
                    onClick={() => props.toggleModal && props.toggleModal('Add Post')}
                >
                    <i className="fas fa-plus-circle"></i> 创建帖子
                </button>
            </div>
        )}

        {/* 评论模态框 */}
        {showComments && (
            <div className="comment-modal-backdrop">
                <div className="comment-modal-container" ref={commentModalRef}>
                    {currentPosts.filter(post => post.id === showComments).map(post => (
                        <div key={post.id} className="comment-modal">
                            <button 
                                className="comment-modal-close"
                                onClick={handleCloseComments}
                            >
                                &times;
                            </button>
                            
                            <div className="comment-modal-content">
                                {/* 左侧：原始帖子内容 */}
                                <div className="modal-post-section">
                                    <div className="post-header">
                                        <div className="post-user-info">
                                            <div className="post-avatar">
                                                {post.avatar ? (
                                                    <img src={post.avatar} alt={post.author} />
                                                ) : (
                                                    <div className="post-avatar-placeholder">
                                                        {post.author.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="post-username">{post.author}</span>
                                        </div>
                                        <div className="post-actions-menu">
                                            <div className="post-timestamp">{post.timestamp}</div>
                                            {post.author === props.user && (
                                                <button 
                                                    className="post-delete-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePost(post.id);
                                                        handleCloseComments(); // 关闭评论模态框
                                                    }}
                                                    title="删除帖子"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {post.imageUrl ? (
                                        <div className="modal-image-container">
                                            <img
                                                src={post.imageUrl}
                                                alt={`Post`}
                                                className="modal-post-image"
                                            />
                                        </div>
                                    ) : (
                                        <div className="modal-text-post-container">
                                            <h3 className="post-title-featured">{post.title}</h3>
                                        </div>
                                    )}
                                    
                                    <div className="post-details">
                                        {post.imageUrl && <h3 className="post-title">{post.title}</h3>}
                                        <p className="post-body">{post.text}</p>
                                    </div>
                                </div>
                                
                                {/* 右侧：评论部分 */}
                                <div className="modal-comments-section">
                                    <div className="comments-header">
                                        <h4>评论</h4>
                                    </div>
                                    
                                    {/* 评论列表 */}
                                    <div className="comments-list">
                                        {post.comments && post.comments.length > 0 ? (
                                            <ul>
                                                {post.comments.map((comment, idx) => (
                                                    <li key={idx} className="comment-item">
                                                        <div className="comment-header">
                                                            <div className="comment-user">{comment.username}</div>
                                                            {comment.username === props.user && (
                                                                <div className="comment-actions">
                                                                    {editingCommentId === idx ? (
                                                                        <>
                                                                            <button 
                                                                                className="save-comment-button"
                                                                                onClick={() => handleSubmitEditComment(post.id, idx)}
                                                                                title="保存评论"
                                                                            >
                                                                                <i className="fas fa-check"></i>
                                                                            </button>
                                                                            <button 
                                                                                className="cancel-edit-button"
                                                                                onClick={handleCancelEditComment}
                                                                                title="取消编辑"
                                                                            >
                                                                                <i className="fas fa-times"></i>
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button 
                                                                                className="edit-comment-button"
                                                                                onClick={() => handleStartEditComment(idx, comment.comment)}
                                                                                title="编辑评论"
                                                                            >
                                                                                <i className="fas fa-edit"></i>
                                                                            </button>
                                                                            <button 
                                                                                className="delete-comment-button"
                                                                                onClick={() => handleDeleteComment(post.id, idx)}
                                                                                title="删除评论"
                                                                            >
                                                                                <i className="fas fa-trash-alt"></i>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {editingCommentId === idx ? (
                                                            <textarea
                                                                className="edit-comment-textarea"
                                                                value={editCommentText}
                                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <div className="comment-text">{comment.comment}</div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="no-comments">暂无评论</p>
                                        )}
                                    </div>
                                    
                                    {/* 添加新评论 */}
                                    <div className="add-comment">
                                        <textarea
                                            placeholder="添加评论..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="comment-input"
                                        />
                                        <button 
                                            className="submit-comment"
                                            onClick={() => handleSubmitComment(post.id)}
                                            disabled={!newComment.trim()}
                                        >
                                            发布
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Instagram 风格的分页控件 */}
        {totalPages > 1 && (
            <div className="instagram-pagination">
                <button
                    className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <i className="fas fa-chevron-left"></i>
                </button>
                
                <div className="pagination-dots">
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={`pagination-dot ${currentPage === index + 1 ? 'active' : ''}`}
                            aria-label={`Page ${index + 1}`}
                        >
                            <span></span>
                        </button>
                    ))}
                </div>
                
                <button
                    className={`pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <i className="fas fa-chevron-right"></i>
                </button>
            </div>
        )}

        {/* 添加提示窗口 */}
        {showNoResults && (
            <div className="no-results-alert">
                No results found
            </div>
        )}

    </main>
}

export default MyPosts;