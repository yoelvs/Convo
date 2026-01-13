import React, { useState, useEffect } from 'react';
import { friendApi } from '../api/friendApi';
import { useAuth } from '../hooks/useAuth';
import '../styles/components/FriendRequestList.css';

export const FriendRequestList = () => {
  const { user: currentUser } = useAuth();
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
    // Refresh requests every 2 seconds to catch new outgoing requests
    const interval = setInterval(loadRequests, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    try {
      const data = await friendApi.getRequests();
      // Filter out current user from incoming requests
      const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();
      const filteredIncoming = (data.incoming || []).filter(request => {
        const fromUserId = request.fromUser?._id?.toString() || request.fromUser?.toString();
        return fromUserId !== currentUserId;
      });
      // Filter out current user from outgoing requests
      const filteredOutgoing = (data.outgoing || []).filter(request => {
        const toUserId = request.toUser?._id?.toString() || request.toUser?.toString();
        return toUserId !== currentUserId;
      });
      setRequests({ incoming: filteredIncoming, outgoing: filteredOutgoing });
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await friendApi.acceptRequest(requestId);
      loadRequests();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await friendApi.declineRequest(requestId);
      loadRequests();
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="friend-requests">
      <h2>Friend Requests</h2>
      
      <div className="requests-section">
        <h3>Incoming Requests</h3>
        {requests.incoming.length === 0 ? (
          <p>No incoming requests</p>
        ) : (
          <div className="requests-list">
            {requests.incoming.map((request) => (
              <div key={request._id} className="request-item">
                {request.fromUser?.avatarUrl ? (
                  <img
                    src={request.fromUser.avatarUrl}
                    alt={request.fromUser?.username}
                    className="request-avatar"
                  />
                ) : (
                  <div className="request-avatar-placeholder">
                    {request.fromUser?.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="request-info">
                  <div className="request-username">{request.fromUser?.username}</div>
                  <div className="request-email">{request.fromUser?.email}</div>
                </div>
                <div className="request-actions">
                  <button
                    onClick={() => handleAccept(request._id)}
                    className="accept-btn"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(request._id)}
                    className="decline-btn"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="requests-section">
        <h3>Outgoing Requests</h3>
        {requests.outgoing.length === 0 ? (
          <p>No outgoing requests</p>
        ) : (
          <div className="requests-list">
            {requests.outgoing.map((request) => (
              <div key={request._id} className="request-item">
                {request.toUser?.avatarUrl ? (
                  <img
                    src={request.toUser.avatarUrl}
                    alt={request.toUser?.username}
                    className="request-avatar"
                  />
                ) : (
                  <div className="request-avatar-placeholder">
                    {request.toUser?.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="request-info">
                  <div className="request-username">{request.toUser?.username}</div>
                  <div className="request-email">{request.toUser?.email}</div>
                </div>
                <div className="request-status">Pending</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

