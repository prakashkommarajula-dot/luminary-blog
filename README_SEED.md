# Database Seeding Guide

This project includes a comprehensive seeding system to populate your platform with realistic, production-grade data.

## Files Included

1.  **`seed-data.json`**: The generated JSON data containing 50 users, 15 authors, 200 posts, and 500+ comments with realistic distribution.
2.  **`scripts/generate-seed.ts`**: The logic used to generate the data. You can modify the constants here to change the scale of the data.
3.  **`scripts/seed-firestore.ts`**: A script to push the generated data to your Firebase Firestore database.
4.  **`scripts/seed-sql.ts`**: A template script for seeding a PostgreSQL database.
5.  **`DB_SCHEMA.md`**: SQL and MongoDB schema definitions for enterprise use cases.

## How to Generate New Data

If you want to regenerate the data with different parameters:

```bash
npx tsx scripts/generate-seed.ts
```

## How to Seed Firestore

**Note:** Before running this, ensure your Firestore Security Rules allow the writes, or use a Service Account with Admin privileges.

To run the Firestore seed script:

```bash
npx tsx scripts/seed-firestore.ts
```

## Realistic Distribution Rules Applied

- **Viral/Popular Distribution:** Posts have weighted view counts (Viral: 15k-50k, Popular: 5k-15k, etc.).
- **Engagement Ratios:** Likes, Comments, and Bookmarks are calculated as a percentage of views to mimic real user behavior.
- **Author Tiers:** 2 Star Authors (30-40 posts), 5 Regular Authors, and 8 Casual Authors.
- **Follower Tiers:** Top authors have up to 20,000 followers.
- **Temporal Spread:** Posts are spread across the last 2 years, with a higher density in the last month and week.
- **Trending Logic:** Trending flags are assigned based on a weighted score of engagement vs. recency.
- **Draft/Published Split:** Approximately 10% of posts are in 'draft' status.

## Schema Mapping

The data is designed to be compatible with the `firebase-blueprint.json` schema but also includes additional fields for advanced analytics (views, trending scores, etc.) that are common in production environments.
