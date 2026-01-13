import React, { useState } from 'react';
import { PostComposer } from '../components/PostComposer';
import { PostCard } from '../components/PostCard';
import { TopNavbar } from '../components/TopNavbar';
import { useInfiniteFeed } from '../hooks/useInfiniteFeed';
import '../styles/pages/FeedPage.css';

export const FeedPage = () => {
  const { posts, loading, hasMore, loadMore, refresh } = useInfiniteFeed();

  const handlePostCreated = (newPost) => {
    // Don't add manually - refresh will load it from the server
    // This prevents duplication
    refresh();
  };

  const handlePostUpdate = (updatedPost) => {
    // If updatedPost is null, it means the post was deleted
    if (updatedPost === null) {
      refresh(); // Refresh to remove deleted post from list
    } else {
      // Update is handled by the hook's refresh mechanism
      refresh();
    }
  };

  // Remove duplicates based on post._id
  const uniquePosts = React.useMemo(() => {
    const seen = new Set();
    return posts.filter((post) => {
      const id = post._id?.toString() || post._id;
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  }, [posts]);

  return (
    <div className="feed-page">
      <TopNavbar />
      <div className="feed-container">
        <h1>Feed</h1>
        <PostComposer onPostCreated={handlePostCreated} />
        <div className="posts-list">
          {uniquePosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpdate={handlePostUpdate}
            />
          ))}
        </div>
        {loading && <div className="loading">Loading...</div>}
        {hasMore && !loading && (
          <button onClick={loadMore} className="load-more-btn">
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

