# SQL ERD Documentation

This document describes the SQL database schema design for the Social Network application. While the application uses MongoDB for the main implementation, this ERD represents how the data would be structured in a relational database.

## Entity Relationship Diagram

```
┌─────────────┐
│   Users     │
├─────────────┤
│ id (PK)     │
│ username    │
│ email       │
│ password_   │
│   hash      │
│ avatar_url  │
│ bio         │
│ last_seen   │
│ created_at  │
│ updated_at  │
└─────────────┘
       │
       │ 1
       │
       │ N
┌─────────────┐
│   Posts     │
├─────────────┤
│ id (PK)     │
│ user_id (FK)│
│ text        │
│ created_at  │
│ updated_at  │
└─────────────┘
       │
       │ 1
       │
       │ N
┌─────────────┐
│   Media     │
├─────────────┤
│ id (PK)     │
│ post_id (FK)│
│ url         │
│ type        │
│ created_at  │
└─────────────┘

┌─────────────┐
│   Likes     │
├─────────────┤
│ id (PK)     │
│ user_id (FK)│
│ post_id (FK)│
│ created_at  │
└─────────────┘

┌─────────────┐
│  Comments   │
├─────────────┤
│ id (PK)     │
│ post_id (FK)│
│ user_id (FK)│
│ text        │
│ created_at  │
│ updated_at  │
└─────────────┘

┌──────────────────┐
│ FriendRequests   │
├──────────────────┤
│ id (PK)          │
│ from_user_id(FK) │
│ to_user_id (FK)  │
│ status           │
│ created_at       │
│ updated_at       │
└──────────────────┘

┌─────────────┐
│ ChatRooms   │
├─────────────┤
│ id (PK)     │
│ type        │
│ name        │
│ last_msg_at │
│ created_at  │
│ updated_at  │
└─────────────┘
       │
       │ 1
       │
       │ N
┌─────────────┐
│  Members    │
├─────────────┤
│ id (PK)     │
│ room_id(FK) │
│ user_id(FK) │
│ joined_at   │
└─────────────┘

┌─────────────┐
│  Messages   │
├─────────────┤
│ id (PK)     │
│ room_id(FK) │
│ sender_id   │
│   (FK)      │
│ content     │
│ created_at  │
│ updated_at  │
└─────────────┘
       │
       │ 1
       │
       │ N
┌─────────────┐
│ MessageRead │
├─────────────┤
│ id (PK)     │
│ message_id  │
│   (FK)      │
│ user_id(FK) │
│ read_at     │
└─────────────┘
```

## Table Definitions

### Users
Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| username | VARCHAR(30) | UNIQUE, NOT NULL | Username (3-30 chars) |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| avatar_url | VARCHAR(500) | NULL | URL to avatar image |
| bio | TEXT | NULL | User biography (max 500 chars) |
| last_seen | TIMESTAMP | NULL | Last seen timestamp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (username)
- UNIQUE INDEX (email)

### Posts
Stores user posts/status updates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique post identifier |
| user_id | BIGINT | FOREIGN KEY (Users.id), NOT NULL | Post author |
| text | TEXT | NULL | Post content (max 5000 chars) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Post creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (user_id, created_at DESC) - For user feed queries
- INDEX (created_at DESC) - For global feed queries

**Foreign Keys:**
- user_id → Users(id) ON DELETE CASCADE

### Media
Stores media attachments for posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique media identifier |
| post_id | BIGINT | FOREIGN KEY (Posts.id), NOT NULL | Associated post |
| url | VARCHAR(500) | NOT NULL | Media URL (S3/Cloudinary) |
| type | VARCHAR(20) | NULL | Media type (image/video) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Upload time |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (post_id)

**Foreign Keys:**
- post_id → Posts(id) ON DELETE CASCADE

### Likes
Stores post likes (many-to-many relationship).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique like identifier |
| user_id | BIGINT | FOREIGN KEY (Users.id), NOT NULL | User who liked |
| post_id | BIGINT | FOREIGN KEY (Posts.id), NOT NULL | Liked post |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Like timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (user_id, post_id) - Prevent duplicate likes
- INDEX (post_id)

**Foreign Keys:**
- user_id → Users(id) ON DELETE CASCADE
- post_id → Posts(id) ON DELETE CASCADE

### Comments
Stores comments on posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique comment identifier |
| post_id | BIGINT | FOREIGN KEY (Posts.id), NOT NULL | Commented post |
| user_id | BIGINT | FOREIGN KEY (Users.id), NOT NULL | Comment author |
| text | TEXT | NOT NULL | Comment content (max 1000 chars) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Comment creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (post_id, created_at DESC)

**Foreign Keys:**
- post_id → Posts(id) ON DELETE CASCADE
- user_id → Users(id) ON DELETE CASCADE

### FriendRequests
Stores friend requests between users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique request identifier |
| from_user_id | BIGINT | FOREIGN KEY (Users.id), NOT NULL | Request sender |
| to_user_id | BIGINT | FOREIGN KEY (Users.id), NOT NULL | Request recipient |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Status: pending/accepted/declined |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Request creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (from_user_id, to_user_id) - Prevent duplicate requests
- INDEX (to_user_id, status) - For incoming requests query
- INDEX (from_user_id, status) - For outgoing requests query

**Foreign Keys:**
- from_user_id → Users(id) ON DELETE CASCADE
- to_user_id → Users(id) ON DELETE CASCADE

**Note:** For friend relationships, a separate `Friends` junction table could be created, or the accepted FriendRequests can be queried.

### ChatRooms
Stores chat rooms (private or group).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique room identifier |
| type | VARCHAR(20) | NOT NULL | Room type: 'private' or 'group' |
| name | VARCHAR(100) | NULL | Group name (for group chats) |
| last_msg_at | TIMESTAMP | NULL | Last message timestamp |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Room creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (last_msg_at DESC) - For room ordering

### Members
Junction table for chat room membership (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique membership identifier |
| room_id | BIGINT | FOREIGN KEY (ChatRooms.id), NOT NULL | Chat room |
| user_id | BIGINT | FOREIGN KEY (Users.id), NOT NULL | Room member |
| joined_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Join timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (room_id, user_id) - Prevent duplicate memberships
- INDEX (user_id) - For user's rooms query
- INDEX (room_id) - For room members query

**Foreign Keys:**
- room_id → ChatRooms(id) ON DELETE CASCADE
- user_id → Users(id) ON DELETE CASCADE

### Messages
Stores chat messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique message identifier |
| room_id | BIGINT | FOREIGN KEY (ChatRooms.id), NOT NULL | Chat room |
| sender_id | BIGINT | FOREIGN KEY (Users.id), NOT NULL | Message sender |
| content | TEXT | NOT NULL | Message content (max 5000 chars) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Message creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (room_id, created_at DESC) - For room messages query
- INDEX (created_at DESC) - For pagination

**Foreign Keys:**
- room_id → ChatRooms(id) ON DELETE CASCADE
- sender_id → Users(id) ON DELETE CASCADE

### MessageRead
Stores read receipts for messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique read receipt identifier |
| message_id | BIGINT | FOREIGN KEY (Messages.id), NOT NULL | Message |
| user_id | BIGINT | FOREIGN KEY (Users.id), NOT NULL | User who read |
| read_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Read timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (message_id, user_id) - Prevent duplicate receipts
- INDEX (message_id)
- INDEX (user_id)

**Foreign Keys:**
- message_id → Messages(id) ON DELETE CASCADE
- user_id → Users(id) ON DELETE CASCADE

## Relationships Summary

1. **Users → Posts**: One-to-Many (a user can have many posts)
2. **Posts → Media**: One-to-Many (a post can have many media items)
3. **Users ↔ Posts (Likes)**: Many-to-Many via Likes table
4. **Posts → Comments**: One-to-Many (a post can have many comments)
5. **Users ↔ Users (FriendRequests)**: Many-to-Many via FriendRequests table
6. **Users ↔ ChatRooms (Members)**: Many-to-Many via Members table
7. **ChatRooms → Messages**: One-to-Many (a room can have many messages)
8. **Messages → MessageRead**: One-to-Many (a message can have many read receipts)

## Query Examples

### Get user feed (friends + self posts)
```sql
SELECT p.*, u.username, u.avatar_url
FROM Posts p
JOIN Users u ON p.user_id = u.id
WHERE p.user_id IN (
  SELECT to_user_id FROM FriendRequests 
  WHERE from_user_id = ? AND status = 'accepted'
  UNION
  SELECT from_user_id FROM FriendRequests 
  WHERE to_user_id = ? AND status = 'accepted'
  UNION
  SELECT ? -- Include self
)
ORDER BY p.created_at DESC
LIMIT 20;
```

### Get chat room messages with pagination
```sql
SELECT m.*, u.username, u.avatar_url
FROM Messages m
JOIN Users u ON m.sender_id = u.id
WHERE m.room_id = ?
  AND m.created_at < ?
ORDER BY m.created_at DESC
LIMIT 50;
```

### Get unread message count per room
```sql
SELECT room_id, COUNT(*) as unread_count
FROM Messages m
WHERE room_id IN (
  SELECT room_id FROM Members WHERE user_id = ?
)
AND m.id NOT IN (
  SELECT message_id FROM MessageRead WHERE user_id = ?
)
GROUP BY room_id;
```

