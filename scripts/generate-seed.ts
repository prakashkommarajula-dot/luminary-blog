import { faker, fakerEN_IN } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

// Types based on requirements
interface User {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL: string;
  role: 'admin' | 'author' | 'reader';
  bio: string;
  location: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  socialLinks: {
    twitter?: string;
    github?: string;
    website?: string;
    linkedin?: string;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  status: 'draft' | 'published';
  category: string;
  tags: string[];
  readingTime: number;
  views: number;
  likesCount: number;
  bookmarksCount: number;
  commentsCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  trending: boolean;
  editorPick: boolean;
  seoDescription: string;
  relatedPostIds?: string[];
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  likesCount: number;
  parentId: string | null;
  createdAt: string;
}

const CATEGORIES = [
  'Web Development',
  'React / Next.js',
  'JavaScript / TypeScript',
  'Backend / APIs',
  'DevOps / Cloud',
  'UI/UX Design',
  'AI / ML',
  'Career / Interview Prep',
  'Productivity',
  'Startups / Tech Trends'
];

const INDIAN_CITIES = ['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai', 'Gurgaon', 'Noida', 'Ahmedabad', 'Kolkata'];
const GLOBAL_CITIES = ['San Francisco', 'London', 'Berlin', 'New York', 'Singapore', 'Austin', 'Seattle', 'Toronto', 'Amsterdam', 'Sydney'];

const TECH_CONTENT = {
  'Web Development': [
    {
      title: 'The Future of Web Components in 2024',
      excerpt: 'Exploring how native web components are finally becoming a viable alternative to heavy framework-based components for enterprise design systems.',
      content: `## The Rise of Native Standards\n\nFor years, the web development community has been divided between various frameworks like React, Vue, and Angular. However, the underlying web standards have been quietly evolving. Web Components, once a niche technology, are now seeing widespread adoption in large-scale enterprise environments.\n\n### Why Now?\n\nBrowser support is finally consistent across all major platforms. With the introduction of the Shadow DOM and Custom Elements, developers can now create truly encapsulated components that work anywhere, regardless of the stack.\n\n### Impact on Design Systems\n\nCompanies like Adobe, IBM, and Salesforce are moving their design systems to Web Components. This allows them to provide a consistent UI library that can be used by teams working in different frameworks without rewriting the logic for each one.\n\n### Performance and Encapsulation\n\nOne of the biggest advantages of Web Components is the Shadow DOM. This provides a truly isolated environment for your styles and scripts, preventing the "leaky CSS" problem that plagues large-scale applications. When you're building a design system that needs to be consumed by hundreds of different apps, this level of isolation is a game-changer.\n\n### The Future is Standardized\n\nAs we look toward the future, the goal is to write less framework-specific code and more standard web code. This reduces technical debt and makes our applications more resilient to the ever-changing landscape of JavaScript frameworks. By investing in Web Components today, you're future-proofing your frontend architecture for the next decade.`
    },
    {
      title: 'Mastering CSS Grid for Complex Enterprise Layouts',
      excerpt: 'A deep dive into advanced CSS Grid techniques that solve common layout challenges in data-heavy dashboards and complex web applications.',
      content: `## Beyond the Basics\n\nMost developers know how to create a simple grid, but few master the power of named grid areas and auto-placement algorithms. When building enterprise dashboards, these features become essential for maintaining clean, responsive code.\n\n### Subgrid: The Game Changer\n\nOne of the most requested features in CSS history, Subgrid, is now widely supported. It allows child elements to inherit the grid tracks of their parents, enabling perfect alignment across nested components. This is particularly useful for complex forms or data tables where you want consistent alignment across different sections of the page.\n\n### The Power of Named Areas\n\nInstead of thinking in terms of "column 1 to 3", named areas allow you to define your layout semantically. This makes your CSS much more readable and easier to maintain. For example, you can define a layout like "header header" "nav main" "footer footer", and then simply assign elements to those areas.\n\n### Performance Considerations\n\nWhile Grid is powerful, overusing complex grid definitions can impact rendering performance on lower-end devices. We'll explore how to balance layout flexibility with browser efficiency. Using 'grid-template-areas' is generally very performant, but be careful with deeply nested grids that all use 'subgrid' if you have thousands of elements.\n\n### Conclusion\n\nCSS Grid is no longer a "nice to have" feature; it's the foundation of modern web layout. By mastering these advanced techniques, you can build interfaces that are both beautiful and highly functional, while keeping your codebase manageable.`
    }
  ],
  'React / Next.js': [
    {
      title: 'Optimizing Next.js App Router for Production',
      excerpt: 'Learn the essential patterns for maximizing performance and SEO when using the Next.js App Router in a large-scale production environment.',
      content: `## The Paradigm Shift\n\nThe App Router in Next.js represents a fundamental change in how we build React applications. By moving to a server-first architecture, we can significantly reduce the amount of JavaScript sent to the client.\n\n### Server Components vs. Client Components\n\nUnderstanding when to use 'use client' is the most critical skill in modern Next.js development. We'll look at patterns for keeping the client-side bundle as small as possible while still providing rich interactivity. The general rule is: stay on the server as long as possible. Only move to the client when you need state, effects, or browser-only APIs.\n\n### Data Fetching Patterns\n\nGone are the days of useEffect for initial data fetching. With React Server Components, we can fetch data directly in our components using async/await, leading to cleaner code and faster page loads. This also eliminates the "waterfall" problem where multiple components fetch data sequentially, as the server can handle these requests in parallel before sending the HTML to the client.\n\n### Streaming and Suspense\n\nNext.js allows you to stream parts of your page as they become ready. This means your users can see the layout and static content immediately, while heavy data-driven sections load in the background. This drastically improves the perceived performance of your application, especially on slower networks.\n\n### SEO and Metadata\n\nWith the new Metadata API, managing SEO in Next.js has never been easier. You can define static or dynamic metadata for every route, ensuring that your pages are perfectly optimized for search engines and social media sharing.`
    }
  ],
  'AI / ML': [
    {
      title: 'Integrating Large Language Models into Web Apps',
      excerpt: 'A practical guide for developers looking to add AI capabilities to their applications using OpenAI, Anthropic, or open-source models.',
      content: `## The New Frontier\n\nGenerative AI is transforming how users interact with software. As web developers, we now have the tools to integrate powerful language models directly into our workflows. Whether it's for automated content generation, intelligent search, or personalized user experiences, the possibilities are endless.\n\n### Prompt Engineering for Developers\n\nWriting good prompts is as much a technical skill as writing good code. We'll explore techniques like few-shot prompting and chain-of-thought to get consistent results from LLMs. It's not just about asking a question; it's about providing the right context and constraints to guide the model toward the desired output.\n\n### Security and Privacy\n\nWhen integrating AI, protecting user data is paramount. We'll discuss how to use private VPCs and data masking to ensure that sensitive information never leaves your infrastructure. Many enterprise clients are hesitant to use AI because of data privacy concerns, so being able to demonstrate a secure implementation is a huge competitive advantage.\n\n### The Rise of Local Models\n\nWhile cloud-based APIs like OpenAI are popular, there's a growing trend toward running smaller, specialized models locally or on your own servers. Tools like Ollama and Llama.cpp are making it easier than ever to deploy AI without relying on third-party providers. This offers better latency, lower costs, and complete control over your data.`
    }
  ],
  'Startups / Tech Trends': [
    {
      title: 'The Rise of the Indian SaaS Ecosystem',
      excerpt: 'How Indian startups are moving from service-based models to building world-class product companies for a global audience.',
      content: `## The Shift from Services to Products\n\nFor decades, India was known as the "back office" of the world, dominated by massive IT service companies. However, the last decade has seen a dramatic shift. A new generation of founders is building SaaS products from India that are competing—and winning—on a global scale.\n\n### The "Freshworks" Effect\n\nCompanies like Freshworks, Zoho, and Postman have proven that you can build a multi-billion dollar product company out of Chennai, Bangalore, or Hyderabad. This has inspired thousands of developers to take the plunge into entrepreneurship, fueled by a deep pool of technical talent and a growing venture capital ecosystem.\n\n### Why India is Winning in SaaS\n\nThe combination of high-quality engineering talent and a lower cost base allows Indian SaaS companies to iterate faster and offer more competitive pricing. Moreover, the "remote-first" nature of modern software sales means that being in San Francisco is no longer a prerequisite for success in the US market.\n\n### Challenges and Opportunities\n\nDespite the success, challenges remain. Navigating global regulations, building brand trust, and finding product-market fit in diverse markets are constant hurdles. However, the resilience and ingenuity of Indian founders are turning these challenges into opportunities for innovation.\n\n### The Future is Bright\n\nAs we look ahead, the Indian SaaS ecosystem is poised for even greater growth. With the rise of AI and the continued digitization of global businesses, the next decade will likely see many more Indian companies becoming household names in the tech world.`
    }
  ],
  'Career / Interview Prep': [
    {
      title: 'Cracking the Tech Interview in the Age of AI',
      excerpt: 'How the hiring landscape is changing and what you need to focus on to stand out in a competitive market.',
      content: `## The New Reality of Hiring\n\nThe tech interview process has always been stressful, but the introduction of AI tools like ChatGPT and GitHub Copilot has added a new layer of complexity. Companies are now rethinking how they evaluate candidates, moving away from simple coding puzzles toward more holistic assessments.\n\n### Beyond LeetCode\n\nWhile data structures and algorithms are still important, many top-tier companies are now focusing on system design, code quality, and architectural thinking. They want to see how you solve real-world problems, not just how well you can memorize a sorting algorithm. AI can write code, but it can't (yet) design a resilient, scalable system.\n\n### The Importance of Soft Skills\n\nIn a world where AI can handle the "grunt work" of coding, human skills like communication, empathy, and leadership are becoming more valuable than ever. Being able to explain your thought process, collaborate effectively with a team, and mentor others are the traits that define a senior engineer.\n\n### Preparing for the "AI-Assisted" Interview\n\nSome companies are now allowing candidates to use AI during the interview, focusing instead on how they use the tool to arrive at a solution. This requires a different kind of preparation—one that focuses on prompt engineering, code review, and debugging rather than just writing code from scratch.\n\n### Conclusion\n\nThe bar for entry into the tech industry is rising, but so are the opportunities. By focusing on the skills that AI can't easily replicate, you can position yourself as a highly valuable asset in any organization.`
    }
  ]
};

const GENERIC_TOPICS = [
  { topic: 'Microservices Architecture', category: 'Backend / APIs' },
  { topic: 'TypeScript Best Practices', category: 'JavaScript / TypeScript' },
  { topic: 'UI Design Systems', category: 'UI/UX Design' },
  { topic: 'Cloud Security', category: 'DevOps / Cloud' },
  { topic: 'Developer Productivity', category: 'Productivity' },
  { topic: 'Scaling React Apps', category: 'React / Next.js' },
  { topic: 'API Documentation', category: 'Backend / APIs' },
  { topic: 'Frontend Performance', category: 'Web Development' },
  { topic: 'Machine Learning Basics', category: 'AI / ML' },
  { topic: 'Remote Work Culture', category: 'Productivity' }
];

function generateDetailedContent(topic: string, category: string) {
  const intro = `In today's fast-paced tech landscape, mastering ${topic} has become essential for developers looking to stay competitive. This article explores the core principles and advanced strategies for implementing ${topic} in modern applications.`;
  const section1 = `## Understanding the Core of ${topic}\n\nAt its heart, ${topic} is about solving complex problems with elegant solutions. Whether you're working on a small project or a large-scale enterprise system, the fundamentals remain the same. We'll look at how to structure your code for maximum maintainability and performance.`;
  const section2 = `### Practical Implementation\n\nWhen it comes to ${topic}, theory is only half the battle. You need to know how to apply these concepts in a real-world environment. We'll walk through a step-by-step example of how to integrate ${topic} into your existing workflow, using industry-standard tools and best practices.`;
  const section3 = `## Challenges and Trade-offs\n\nNo technology is a silver bullet. ${topic} comes with its own set of challenges, from architectural complexity to performance overhead. It's important to understand these trade-offs before making a decision. We'll discuss the most common pitfalls and how to avoid them.`;
  const conclusion = `### Final Thoughts\n\nAs the industry continues to evolve, ${topic} will undoubtedly play an even larger role in how we build and deploy software. By staying informed and continuously learning, you can ensure that you're always at the forefront of innovation.`;
  
  return `${intro}\n\n${section1}\n\n${section2}\n\n${section3}\n\n${conclusion}`;
}

const BIO_TEMPLATES = [
  "Senior Software Engineer @ Google | Open Source Contributor | Tech Speaker",
  "Product Designer at a leading fintech startup. I write about UI/UX, accessibility, and design systems.",
  "Full-stack Developer & Technical Writer. Sharing my journey through the world of JavaScript and TypeScript.",
  "DevOps Engineer with 8+ years of experience. Passionate about Kubernetes, AWS, and automation.",
  "Engineering Manager | Building high-performance teams | Occasional blogger on leadership and tech culture.",
  "Self-taught developer sharing tips on how to break into tech and land your first job.",
  "Software Architect specializing in distributed systems and cloud-native applications.",
  "Frontend Engineer obsessed with performance and animations. Creator of several popular UI libraries.",
  "Data Scientist turned Web Developer. Exploring the intersection of AI and the modern web.",
  "Independent Creator & Indie Hacker. Building products in public and sharing the lessons learned."
];

const COMMENT_TEMPLATES = [
  "This is a fantastic breakdown! I've been looking for a clear explanation of this concept for a while.",
  "Great article. One thing I'd add is that performance can also be impacted by how you handle state updates in this scenario.",
  "Thanks for sharing! I've implemented a similar pattern in my project and it's working beautifully.",
  "I love the way you explained the trade-offs here. It's not always a clear-cut decision.",
  "Excellent write-up. The code examples are very practical and easy to follow.",
  "I've shared this with my team. We're currently debating which approach to take for our new microservice.",
  "Could you elaborate more on how this handles edge cases like network timeouts?",
  "This is exactly the kind of content I come to Luminary for. High quality and actionable.",
  "I've been following your work for a while, and this might be your best post yet. Keep it up!",
  "Interesting perspective. I've had a slightly different experience with this library, but I see your point."
];

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

function generateSeedData() {
  console.log('🚀 Starting enhanced seed data generation...');

  const users: User[] = [];
  const authors: User[] = [];
  const posts: Post[] = [];
  const comments: Comment[] = [];
  const likes: any[] = [];
  const bookmarks: any[] = [];
  const follows: any[] = [];
  const readingHistory: any[] = [];

  // Helper for regional distribution
  const getRegionData = () => {
    const isIndia = Math.random() < 0.75;
    const f = isIndia ? fakerEN_IN : faker;
    const city = isIndia ? faker.helpers.arrayElement(INDIAN_CITIES) : faker.helpers.arrayElement(GLOBAL_CITIES);
    const country = isIndia ? 'India' : faker.location.country();
    return { f, location: `${city}, ${country}` };
  };

  // 1. Generate 50 Registered Users (Readers)
  for (let i = 0; i < 50; i++) {
    const { f, location } = getRegionData();
    const firstName = f.person.firstName();
    const lastName = f.person.lastName();
    const username = f.internet.username({ firstName, lastName });
    
    users.push({
      uid: faker.string.uuid(),
      email: f.internet.email({ firstName, lastName }),
      displayName: `${firstName} ${lastName}`,
      username,
      photoURL: `https://picsum.photos/seed/${username}/200/200`,
      role: 'reader',
      bio: f.helpers.arrayElement(BIO_TEMPLATES),
      location,
      createdAt: f.date.past({ years: 2 }).toISOString(),
      followersCount: f.number.int({ min: 0, max: 100 }),
      followingCount: f.number.int({ min: 0, max: 200 }),
      socialLinks: {
        twitter: `https://twitter.com/${username}`,
        github: `https://github.com/${username}`
      }
    });
  }

  // 2. Generate 15 Authors
  const authorTiers = [
    { count: 2, tier: 'star', postRange: [30, 40], followerRange: [5000, 20000] },
    { count: 5, tier: 'regular', postRange: [10, 20], followerRange: [1000, 5000] },
    { count: 8, tier: 'casual', postRange: [2, 8], followerRange: [50, 1000] }
  ];

  authorTiers.forEach(tierConfig => {
    for (let i = 0; i < tierConfig.count; i++) {
      const { f, location } = getRegionData();
      const firstName = f.person.firstName();
      const lastName = f.person.lastName();
      const username = f.internet.username({ firstName, lastName });
      
      const author: User = {
        uid: faker.string.uuid(),
        email: f.internet.email({ firstName, lastName }),
        displayName: `${firstName} ${lastName}`,
        username,
        photoURL: `https://picsum.photos/seed/${username}/200/200`,
        role: 'author',
        bio: f.helpers.arrayElement(BIO_TEMPLATES),
        location,
        createdAt: f.date.past({ years: 3 }).toISOString(),
        followersCount: f.number.int({ min: tierConfig.followerRange[0], max: tierConfig.followerRange[1] }),
        followingCount: f.number.int({ min: 50, max: 500 }),
        socialLinks: {
          twitter: `https://twitter.com/${username}`,
          github: `https://github.com/${username}`,
          linkedin: `https://linkedin.com/in/${username}`,
          website: f.internet.url()
        }
      };
      authors.push(author);
      (author as any).postTarget = f.number.int({ min: tierConfig.postRange[0], max: tierConfig.postRange[1] });
    }
  });

  // 3. Generate 200 Blog Posts
  const viewTiers = [
    { count: 10, range: [15000, 50000] },
    { count: 30, range: [5000, 15000] },
    { count: 60, range: [1000, 5000] },
    { count: 100, range: [50, 1000] }
  ];

  const allViewCounts: number[] = [];
  viewTiers.forEach(tier => {
    for (let i = 0; i < tier.count; i++) {
      allViewCounts.push(faker.number.int({ min: tier.range[0], max: tier.range[1] }));
    }
  });
  allViewCounts.sort(() => Math.random() - 0.5);

  const now = new Date();
  const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
  const postDates = Array.from({ length: 200 }, () => faker.date.between({ from: twoYearsAgo, to: now }));
  postDates.sort((a, b) => b.getTime() - a.getTime());

  let postCounter = 0;
  authors.forEach(author => {
    const target = (author as any).postTarget;
    for (let i = 0; i < target && postCounter < 200; i++) {
      const category = faker.helpers.arrayElement(CATEGORIES);
      const categoryTemplates = (TECH_CONTENT as any)[category] || [];
      let template = categoryTemplates.length > 0 ? faker.helpers.arrayElement(categoryTemplates) : null;
      
      if (!template) {
        const filteredTopics = GENERIC_TOPICS.filter(t => t.category === category);
        const topic = faker.helpers.arrayElement(filteredTopics.length > 0 ? filteredTopics : GENERIC_TOPICS);
        template = {
          title: `${topic.topic} in 2024: A Modern Guide`,
          excerpt: `Master the art of ${topic.topic} with this comprehensive guide designed for professional developers.`,
          content: generateDetailedContent(topic.topic, category)
        };
      }

      const views = allViewCounts[postCounter];
      const publishDate = postDates[postCounter];
      
      const post: Post = {
        id: faker.string.uuid(),
        title: (template as any).title,
        slug: `${generateSlug((template as any).title)}-${faker.string.alphanumeric(5)}`,
        excerpt: (template as any).excerpt,
        content: (template as any).content,
        coverImage: `https://picsum.photos/seed/${postCounter}/1200/630`,
        authorId: author.uid,
        authorName: author.displayName,
        authorPhoto: author.photoURL,
        status: 'published',
        category,
        tags: faker.helpers.arrayElements(['react', 'nextjs', 'typescript', 'javascript', 'nodejs', 'tailwindcss', 'frontend', 'backend', 'fullstack', 'api', 'database', 'cloud', 'aws', 'docker', 'kubernetes', 'ai', 'machinelearning', 'design', 'ux', 'ui', 'productivity', 'career', 'hiring', 'startup', 'tech'], { min: 2, max: 5 }),
        readingTime: Math.ceil((template as any).content.split(' ').length / 200),
        views,
        likesCount: Math.floor(views * faker.number.float({ min: 0.02, max: 0.08 })),
        bookmarksCount: Math.floor(views * faker.number.float({ min: 0.01, max: 0.05 })),
        commentsCount: Math.floor(views * faker.number.float({ min: 0.005, max: 0.02 })),
        publishedAt: publishDate.toISOString(),
        createdAt: faker.date.past({ years: 0.1, refDate: publishDate }).toISOString(),
        updatedAt: publishDate.toISOString(),
        featured: postCounter < 10,
        trending: false,
        editorPick: postCounter >= 10 && postCounter < 20,
        seoDescription: (template as any).excerpt.slice(0, 160)
      };

      posts.push(post);
      postCounter++;
    }
  });

  // Trending calculation
  posts.forEach(post => {
    const daysSince = (now.getTime() - new Date(post.publishedAt!).getTime()) / (1000 * 60 * 60 * 24);
    const score = (post.likesCount * 2 + post.commentsCount * 5 + post.bookmarksCount * 3) / (daysSince + 1);
    (post as any).trendingScore = score;
  });
  const trendingThreshold = [...posts].sort((a, b) => (b as any).trendingScore - (a as any).trendingScore)[15];
  posts.forEach(post => {
    if ((post as any).trendingScore >= (trendingThreshold as any).trendingScore) {
      post.trending = true;
    }
  });

  // Related Posts Mapping
  posts.forEach(post => {
    const related = posts
      .filter(p => p.id !== post.id && p.category === post.category)
      .slice(0, 3)
      .map(p => p.id);
    post.relatedPostIds = related;
  });

  // 4. Generate 500 Comments
  const allUsers = [...users, ...authors];
  for (let i = 0; i < 500; i++) {
    const post = faker.helpers.arrayElement(posts);
    const user = faker.helpers.arrayElement(allUsers);
    
    comments.push({
      id: faker.string.uuid(),
      postId: post.id,
      userId: user.uid,
      userName: user.displayName,
      userPhoto: user.photoURL,
      content: faker.helpers.arrayElement(COMMENT_TEMPLATES),
      likesCount: faker.number.int({ min: 0, max: 50 }),
      parentId: null,
      createdAt: faker.date.between({ from: new Date(post.publishedAt!), to: now }).toISOString()
    });
  }

  // 5. Engagement Data
  for (let i = 0; i < 300; i++) {
    likes.push({
      userId: faker.helpers.arrayElement(allUsers).uid,
      postId: faker.helpers.arrayElement(posts).id,
      createdAt: faker.date.recent({ days: 90 }).toISOString()
    });
  }

  for (let i = 0; i < 100; i++) {
    bookmarks.push({
      userId: faker.helpers.arrayElement(allUsers).uid,
      postId: faker.helpers.arrayElement(posts).id,
      createdAt: faker.date.recent({ days: 90 }).toISOString()
    });
  }

  // Reading History
  allUsers.forEach(user => {
    const historyCount = faker.number.int({ min: 5, max: 15 });
    for (let i = 0; i < historyCount; i++) {
      readingHistory.push({
        userId: user.uid,
        postId: faker.helpers.arrayElement(posts).id,
        readAt: faker.date.recent({ days: 30 }).toISOString(),
        progress: faker.number.int({ min: 10, max: 100 })
      });
    }
  });

  // Follows
  authors.forEach(author => {
    const followerSample = faker.helpers.arrayElements(allUsers, faker.number.int({ min: 5, max: 20 }));
    followerSample.forEach(follower => {
      follows.push({
        followerId: follower.uid,
        followingId: author.uid,
        createdAt: faker.date.past({ years: 1 }).toISOString()
      });
    });
  });

  const seedData = {
    users,
    authors,
    posts,
    comments,
    engagement: {
      likes,
      bookmarks,
      follows,
      readingHistory,
      searchSuggestions: [
        'Next.js 14 App Router',
        'React Server Components',
        'Tailwind CSS best practices',
        'TypeScript utility types',
        'Building a RAG pipeline',
        'System Design Interview',
        'Microservices with Go',
        'Indian Startup Ecosystem',
        'Mastering CSS Grid',
        'State management 2024'
      ]
    },
    metadata: {
      generatedAt: now.toISOString(),
      totalUsers: 1240,
      totalAuthors: 156,
      totalPosts: 1240,
      totalViews: 248500,
      totalComments: 500
    }
  };

  const outputPath = path.join(process.cwd(), 'seed-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2));
  console.log(`✅ Enhanced seed data generated at: ${outputPath}`);
}

generateSeedData();
