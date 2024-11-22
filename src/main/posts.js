import React, {useEffect, useRef, useState} from "react";
import './postList.css'


const Posts= (props) =>{
    const [posts, setPosts] = useState([]);  // To store fetched users
    const [allPosts, setAllPosts] = useState([]);
    const prevFriendsRef = useRef(props.friends);
    const [postTitle, setPostTitle] = useState(''); // Title input state
    const [postBody, setPostBody] = useState('');
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState("text");
    const postImages = [
        'https://images.pexels.com/photos/28894587/pexels-photo-28894587.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load', // Image for first post
        'https://images.pexels.com/photos/27244379/pexels-photo-27244379.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load', // Image for second post
        'https://images.pexels.com/photos/27637391/pexels-photo-27637391.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load', // Image for third post
    ];
    const hardcodedComments = {
        1: [
            { id: 1, name: "John Doe", body: "This is a great post!", email: "john@example.com" },
            { id: 2, name: "Jane Smith", body: "I learned a lot from this.", email: "jane@example.com" }
        ],
        2: [
            { id: 1, name: "Alice Johnson", body: "Very insightful!", email: "alice@example.com" },
            { id: 2, name: "Bob Brown", body: "I agree, this was helpful.", email: "bob@example.com" }
        ],
        // Add more hardcoded comments for other post IDs here
    };


    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);

    const handleCommentClick = () => {
        // Get hardcoded comments for the post
        const postComments = hardcodedComments[posts.id] || [];
        setComments(postComments);
        setShowComments(!showComments);
    };
    const handlePost = () => {
        if (postTitle.trim() && postBody.trim()) {
            const newPost = {
                id: posts.length + 1, // Temporary ID
                title: postTitle,
                body: postBody,
                author: props.user.username?props.user.username:props.form.accountName,
                timestamp: new Date().toLocaleDateString(),
                imageUrl:randomImage
            };

            // Add the new post at the top of the feed
            setPosts([newPost, ...posts]);

            // Clear the input fields
            setPostTitle('');
            setPostBody('');
        } else {
            alert('Please fill in both title and body fields.');
        }
    };

    // Handle clearing the text input
    const handleClear = () => {
        setPostTitle('');
        setPostBody('');
    };
    // Fallback random images for the rest of the posts
    const randomImage = 'https://images.pexels.com/photos/20414000/pexels-photo-20414000.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load';
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/posts');
                const data = await response.json();
                const userIds = [props.user.id, ...props.friends.map(friend => friend.id)]; // Use `props.friends`
                const filteredPosts = data
                    .filter(post => userIds.includes(post.userId))
                    .map((post, index) => {
                        const author = post.userId === props.user.id
                            ? props.user.username
                            : props.friends.find(friend => friend.id === post.userId)?.username || 'Unknown';

                        return {
                            ...post,
                            author,
                            timestamp: "2024/10/19",
                            imageUrl: index < postImages.length ? postImages[index] : randomImage
                        };
                    });

                if (allPosts.length === 0 || JSON.stringify(prevFriendsRef.current) !== JSON.stringify(props.friends)){
                    setAllPosts(filteredPosts); // Save original posts
                    setPosts(filteredPosts);
                    prevFriendsRef.current = props.friends;
                }

            } catch (error) {
                console.error('Failed to fetch posts:', error);
            }
        };

        fetchPosts();
    }, [props.user, props.friends,postImages]); // Add `props.friends` as a dependency
// Added dependencies


    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    // Handle search type change
    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.value);
    };

    // Handle search submission
    const handleSearchSubmit = () => {
        // Filter posts based on the selected search type
        const newFilteredPosts = allPosts.filter(post => {
            if (searchType === "text") {
                return post.title.toLowerCase().includes(searchQuery);
            } else if (searchType === "author") {
                return post.author.toLowerCase().includes(searchQuery);
            }
            return false;
        });
        setPosts(newFilteredPosts);
    };

    return <main className="flex-1 p-4">
        {/* Post Creation */}
        <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
                <div className="image-upload-wrapper bg-light p-4 rounded me-3">
                    <label htmlFor="imageInput" className="custom-file-label">
                        Add Image
                    </label>
                    <input
                        type="file"
                        id="imageInput"
                        name="image"
                        accept="image/*"
                        className="file-input"
                    />
                </div>
                <div className="form-group mb-3">
                <textarea
                    className="form-control mb-2"
                    name="postTitle"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Your post title here"
                ></textarea>
                    <textarea
                        className="form-control"
                        name="postBody"
                        value={postBody}
                        onChange={(e) => setPostBody(e.target.value)}
                        placeholder="Your post content here"
                    ></textarea>

                    <button className="btn btn-primary mt-2 me-2" onClick={handlePost} aria-label="Post Button">
                        Post
                    </button>
                    <button className="btn btn-secondary mt-2" onClick={handleClear}>
                        Clear
                    </button>
                </div>
            </div>
            <div className="text-center">
                <h2 className="h4 font-weight-bold text-secondary">FolksZone</h2>
                <p className="font-italic text-muted">A place for folks</p>
            </div>
        </div>

        {/* Search Bar */}
        <div className="form-group mb-4">
            <div className="d-flex align-items-center">
                {/* Dropdown for search type */}
                <select
                    className="form-control w-auto me-2"
                    value={searchType}
                    onChange={handleSearchTypeChange}
                >
                    <option value="text">Search by Text</option>
                    <option value="author">Search by Author</option>
                </select>

                {/* Search Input */}
                <input
                    type="text"
                    className="form-control"
                    name="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search Posts"
                />

                {/* Submit Button */}
                <button
                    className="btn btn-primary ms-3"
                    onClick={handleSearchSubmit}
                >
                    Search
                </button>
            </div>
        </div>
        <div className="posts-grid">
            <div className="posts-grid">
                {posts.map((post, index) => (
                    <div key={post.id} className="post-card">
                        <div className="post-content">
                            <img
                                src={post.imageUrl}
                                alt={`Post ${index + 1}`}
                                className="post-image"
                            />
                            <h3 className="post-title">{post.title}</h3>
                            <p className="post-body">{post.body}</p>
                            <p className="post-author"><strong>Author:</strong> {post.author}</p>
                            <p className="post-timestamp"><strong>Posted on:</strong> {post.timestamp}</p>
                            <div className="post-buttons">
                                <button className="btn btn-primary">Edit</button>
                                <button className="btn btn-secondary" onClick={handleCommentClick}>
                                    {showComments ? 'Hide Comments' : 'Comment'}
                                </button>
                            </div>
                        </div>
                        {showComments && comments.length > 0 && (
                            <div className="comments-section">
                                <h4>Comments:</h4>
                                <ul>
                                    {/* Uncomment and adjust this block if comments should be dynamic */}
                                    {/* {comments.map(comment => (
                            <li key={comment.id}>
                                <strong>{comment.name}:</strong> {comment.body}
                                <p className="comment-email">({comment.email})</p>
                            </li>
                        ))} */}
                                </ul>
                            </div>
                        )}
                        {showComments && comments.length === 0 && (
                            <ul>
                                <li>hardcoded comments 1</li>
                                <li>hardcoded comments 2</li>
                                <li>...</li>
                            </ul>
                        )}
                    </div>
                ))}
                {posts.length === 0 && <p>No posts found for this user.</p>}
            </div>

        </div>
    </main>
}

export default Posts;