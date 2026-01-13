import { useState, useEffect, useCallback } from 'react';
import { postApi } from '../api/postApi';

export const useInfiniteFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [error, setError] = useState(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const data = await postApi.getFeed(cursor);
      setPosts((prev) => [...prev, ...data.posts]);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, hasMore]);

  useEffect(() => {
    loadMore();
  }, []);

  const refresh = useCallback(async () => {
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    setError(null);
    setLoading(true);

    try {
      const data = await postApi.getFeed(null);
      setPosts(data.posts);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    posts,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
  };
};

