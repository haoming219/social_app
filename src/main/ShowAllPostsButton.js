import React from 'react';
import './showAllPostsButton.css';

const ShowAllPostsButton = ({ onClick }) => {
    return (
        <button className="show-all-posts-button" onClick={onClick}>
            Show All Posts
        </button>
    );
};

export default ShowAllPostsButton; 