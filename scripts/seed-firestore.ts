import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  writeBatch, 
  doc, 
  collection, 
  Timestamp 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Load config
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seedFirestore() {
  const dataPath = path.join(process.cwd(), 'seed-data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ seed-data.json not found. Run generate-seed.ts first.');
    return;
  }

  const seedData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log('🚀 Starting Firestore seeding...');

  const allUsers = [...seedData.users, ...seedData.authors];
  
  // Helper to chunk arrays for batches (Firestore limit is 500)
  const chunk = (arr: any[], size: number) => 
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );

  try {
    // 1. Seed Users
    console.log(`👤 Seeding ${allUsers.length} users...`);
    const userChunks = chunk(allUsers, 400);
    for (const userChunk of userChunks) {
      const batch = writeBatch(db);
      userChunk.forEach((user: any) => {
        const userRef = doc(db, 'users', user.uid);
        batch.set(userRef, {
          ...user,
          createdAt: Timestamp.fromDate(new Date(user.createdAt))
        });
      });
      await batch.commit();
    }

    // 2. Seed Posts
    console.log(`📝 Seeding ${seedData.posts.length} posts...`);
    const postChunks = chunk(seedData.posts, 400);
    for (const postChunk of postChunks) {
      const batch = writeBatch(db);
      postChunk.forEach((post: any) => {
        const postRef = doc(db, 'posts', post.id);
        batch.set(postRef, {
          ...post,
          publishedAt: post.publishedAt ? Timestamp.fromDate(new Date(post.publishedAt)) : null,
          createdAt: Timestamp.fromDate(new Date(post.createdAt)),
          updatedAt: Timestamp.fromDate(new Date(post.updatedAt))
        });
      });
      await batch.commit();
    }

    // 3. Seed Comments
    console.log(`💬 Seeding ${seedData.comments.length} comments...`);
    const commentChunks = chunk(seedData.comments, 400);
    for (const commentChunk of commentChunks) {
      const batch = writeBatch(db);
      commentChunk.forEach((comment: any) => {
        const commentRef = doc(db, 'posts', comment.postId, 'comments', comment.id);
        batch.set(commentRef, {
          ...comment,
          createdAt: Timestamp.fromDate(new Date(comment.createdAt))
        });
      });
      await batch.commit();
    }

    // 4. Seed Reading History
    console.log(`📖 Seeding ${seedData.engagement.readingHistory.length} reading history entries...`);
    const historyChunks = chunk(seedData.engagement.readingHistory, 400);
    for (const historyChunk of historyChunks) {
      const batch = writeBatch(db);
      historyChunk.forEach((entry: any) => {
        const historyRef = doc(collection(db, 'users', entry.userId, 'readingHistory'));
        batch.set(historyRef, {
          ...entry,
          readAt: Timestamp.fromDate(new Date(entry.readAt))
        });
      });
      await batch.commit();
    }

    // 5. Seed Likes
    console.log(`❤️ Seeding ${seedData.engagement.likes.length} likes...`);
    const likeChunks = chunk(seedData.engagement.likes, 400);
    for (const likeChunk of likeChunks) {
      const batch = writeBatch(db);
      likeChunk.forEach((like: any) => {
        const likeRef = doc(db, 'users', like.userId, 'likes', like.postId);
        batch.set(likeRef, {
          ...like,
          createdAt: Timestamp.fromDate(new Date(like.createdAt))
        });
      });
      await batch.commit();
    }

    // 6. Seed Bookmarks
    console.log(`🔖 Seeding ${seedData.engagement.bookmarks.length} bookmarks...`);
    const bookmarkChunks = chunk(seedData.engagement.bookmarks, 400);
    for (const bookmarkChunk of bookmarkChunks) {
      const batch = writeBatch(db);
      bookmarkChunk.forEach((bookmark: any) => {
        const bookmarkRef = doc(db, 'users', bookmark.userId, 'bookmarks', bookmark.postId);
        batch.set(bookmarkRef, {
          ...bookmark,
          createdAt: Timestamp.fromDate(new Date(bookmark.createdAt))
        });
      });
      await batch.commit();
    }

    // 7. Seed Follows
    console.log(`🤝 Seeding ${seedData.engagement.follows.length} follows...`);
    const followChunks = chunk(seedData.engagement.follows, 400);
    for (const followChunk of followChunks) {
      const batch = writeBatch(db);
      followChunk.forEach((follow: any) => {
        const followRef = doc(db, 'users', follow.followerId, 'following', follow.followingId);
        batch.set(followRef, {
          ...follow,
          createdAt: Timestamp.fromDate(new Date(follow.createdAt))
        });
        // Also seed the reverse relationship for easy lookup
        const followerRef = doc(db, 'users', follow.followingId, 'followers', follow.followerId);
        batch.set(followerRef, {
          ...follow,
          createdAt: Timestamp.fromDate(new Date(follow.createdAt))
        });
      });
      await batch.commit();
    }

    // 8. Seed Search Suggestions & Stats
    console.log(`🔍 Seeding metadata...`);
    const suggestionsRef = doc(db, 'metadata', 'search');
    await writeBatch(db).set(suggestionsRef, {
      suggestions: seedData.engagement.searchSuggestions,
      updatedAt: Timestamp.now()
    }).commit();

    const statsRef = doc(db, 'metadata', 'stats');
    await writeBatch(db).set(statsRef, {
      totalPosts: 20236, // Simulating the requested high volume
      totalAuthors: 542,
      totalViews: 1240582,
      updatedAt: Timestamp.now()
    }).commit();

    console.log('✅ Firestore seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedFirestore();
