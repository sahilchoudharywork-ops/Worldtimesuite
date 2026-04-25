export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  dateIso: string;
  author: string;
  metaDescription: string;
  tags: string[];
}

export const BLOG_POSTS_META: BlogPostMeta[] = [
  {
    slug: "why-does-india-have-a-30-minute-time-zone",
    title: "Why Does India Have a 30-Minute Time Zone Offset?",
    date: "February 17, 2025",
    dateIso: "2025-02-17",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "Discover why India's time zone is UTC+5:30 — a quirky 30-minute offset that affects 1.4 billion people. The history, politics, and science behind IST explained.",
    tags: ["IST", "India", "time zones", "UTC offset", "history"],
  },
  {
    slug: "daylight-saving-time-explained",
    title: "What Is Daylight Saving Time — And Why Do So Many Countries Want to Abolish It?",
    date: "February 20, 2025",
    dateIso: "2025-02-20",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "The complete guide to Daylight Saving Time: who invented it, which countries use it, the health effects of clock changes, and why so many nations are trying to end it for good.",
    tags: ["DST", "daylight saving time", "clocks", "health", "time zones"],
  },
  {
    slug: "gmt-vs-utc-difference-explained",
    title: "GMT vs UTC: What's the Actual Difference and Does It Matter?",
    date: "February 24, 2025",
    dateIso: "2025-02-24",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "GMT and UTC are not the same thing — and the difference matters more than you think. A clear, no-jargon explainer of the world's two most important time standards.",
    tags: ["GMT", "UTC", "time standards", "Coordinated Universal Time", "Greenwich Mean Time"],
  },
  {
    slug: "best-time-to-schedule-us-uk-meetings",
    title: "The Best Times to Schedule Meetings Between the US and UK",
    date: "February 27, 2025",
    dateIso: "2025-02-27",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "Finding a meeting time that works across US and UK time zones is trickier than it looks. Here's the definitive guide — covering EST, CST, PST and GMT/BST through every season.",
    tags: ["US UK time difference", "meeting scheduling", "EST GMT", "remote work", "time zones"],
  },
  {
    slug: "country-with-most-time-zones",
    title: "Which Country Has the Most Time Zones in the World? (The Answer Will Surprise You)",
    date: "March 3, 2025",
    dateIso: "2025-03-03",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "The country with the most time zones in the world is not Russia, China, or the US. Discover which nation spans an astonishing 12 time zones and why geography isn't always the deciding factor.",
    tags: ["time zones", "France", "Russia", "US", "geography", "countries"],
  },
];

export const BLOG_POST_META_BY_SLUG: Record<string, BlogPostMeta> = Object.fromEntries(
  BLOG_POSTS_META.map(p => [p.slug, p])
);
