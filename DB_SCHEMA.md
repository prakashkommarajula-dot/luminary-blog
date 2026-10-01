# Enterprise Blogging Platform - Database Schema

This document defines the schema for the platform, compatible with PostgreSQL and MongoDB.

## 1. PostgreSQL Schema (Relational)

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    photo_url TEXT,
    role VARCHAR(20) CHECK (role IN ('admin', 'author', 'reader')) DEFAULT 'reader',
    bio TEXT,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Social Links Table
CREATE TABLE user_social_links (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    PRIMARY KEY (user_id, platform)
);

-- Posts Table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    category VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
    reading_time INT,
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    bookmarks_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    seo_description VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Post Tags Junction
CREATE TABLE post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Comments Table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Engagement Tables
CREATE TABLE post_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE post_bookmarks (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE user_follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);
```

## 2. MongoDB Schema (Document-based)

### User Collection
```json
{
  "_id": "ObjectId",
  "email": "string",
  "displayName": "string",
  "username": "string",
  "photoURL": "string",
  "role": "string",
  "bio": "string",
  "followersCount": "number",
  "followingCount": "number",
  "socialLinks": {
    "twitter": "string",
    "github": "string",
    "linkedin": "string",
    "website": "string"
  },
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Post Collection
```json
{
  "_id": "ObjectId",
  "authorId": "ObjectId",
  "author": {
    "name": "string",
    "photo": "string"
  },
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "string",
  "coverImage": "string",
  "category": "string",
  "tags": ["string"],
  "status": "string",
  "readingTime": "number",
  "analytics": {
    "views": "number",
    "likes": "number",
    "bookmarks": "number",
    "comments": "number"
  },
  "flags": {
    "featured": "boolean",
    "trending": "boolean"
  },
  "seo": {
    "description": "string"
  },
  "publishedAt": "date",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Comment Collection
```json
{
  "_id": "ObjectId",
  "postId": "ObjectId",
  "userId": "ObjectId",
  "user": {
    "name": "string",
    "photo": "string"
  },
  "content": "string",
  "likesCount": "number",
  "parentId": "ObjectId",
  "createdAt": "date"
}
```
