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
  {
    slug: "ist-to-est-complete-guide",
    title: "IST to EST: The Complete Guide to India–US Time Conversion",
    date: "March 6, 2025",
    dateIso: "2025-03-06",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "IST is 10.5 hours ahead of EST — but that gap shifts with Daylight Saving Time. The complete guide to converting India Standard Time to US Eastern Time, with charts and scheduling tips.",
    tags: ["IST", "EST", "India US time", "time zone conversion", "remote work"],
  },
  {
    slug: "why-china-has-one-time-zone",
    title: "Why Does China Use Only One Time Zone for a Country Wider Than the United States?",
    date: "March 9, 2025",
    dateIso: "2025-03-09",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "China spans five natural time zones but uses just one: Beijing Standard Time. Discover the political history, the daily realities in western China, and the secret 'Xinjiang time' millions follow.",
    tags: ["China", "time zones", "Beijing Standard Time", "Xinjiang", "politics"],
  },
  {
    slug: "what-is-est-eastern-standard-time",
    title: "What Is EST? Eastern Standard Time Fully Explained",
    date: "March 11, 2025",
    dateIso: "2025-03-11",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "EST is UTC−5 and applies to the US East Coast from November to March. Learn exactly which states observe EST, how it differs from EDT, and how to convert it to any time zone.",
    tags: ["EST", "Eastern Standard Time", "UTC-5", "time zones", "US time"],
  },
  {
    slug: "remote-team-time-zone-management",
    title: "How to Manage Time Zones on a Remote Team Without Losing Your Mind",
    date: "March 13, 2025",
    dateIso: "2025-03-13",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "Managing a remote team across time zones is hard. Here are the practical systems, tools, and cultural rules that actually work — from overlap windows to async-first communication.",
    tags: ["remote work", "time zones", "distributed teams", "async work", "scheduling"],
  },
  {
    slug: "history-of-greenwich-mean-time",
    title: "The Fascinating History of Greenwich Mean Time and How It Changed the World",
    date: "March 15, 2025",
    dateIso: "2025-03-15",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "Before Greenwich Mean Time, every city kept its own local time. The story of how a hilltop observatory in London standardised time for the entire world — and why it still matters today.",
    tags: ["GMT", "Greenwich Mean Time", "time history", "Royal Observatory", "Prime Meridian"],
  },
  {
    slug: "pst-vs-pdt-difference",
    title: "PST vs PDT: What's the Difference and When Does Each Apply?",
    date: "March 17, 2025",
    dateIso: "2025-03-17",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "PST is UTC−8 in winter; PDT is UTC−7 in summer. Here's exactly when Pacific Time switches, which US states observe it, and how to convert PST and PDT to every major time zone.",
    tags: ["PST", "PDT", "Pacific Time", "time zones", "Daylight Saving Time"],
  },
  {
    slug: "time-zones-around-the-world-weird-facts",
    title: "11 Weird Time Zone Facts That Will Make You Question Everything",
    date: "March 18, 2025",
    dateIso: "2025-03-18",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "From a country where the sun rises at 10am to an island that skipped an entire day, these 11 bizarre time zone facts reveal how strange humanity's relationship with the clock really is.",
    tags: ["time zones", "weird facts", "trivia", "world clock", "time zone history"],
  },
  {
    slug: "new-york-to-london-time-difference",
    title: "New York to London Time Difference: The Complete Guide",
    date: "March 19, 2025",
    dateIso: "2025-03-19",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "The New York to London time difference is usually 5 hours, but shifts to 4 hours for three weeks in March. Here's the full breakdown by season, with conversion tables and meeting tips.",
    tags: ["New York London time", "EST GMT", "time difference", "US UK", "scheduling"],
  },
  {
    slug: "what-is-utc-time-explained",
    title: "What Is UTC Time? Coordinated Universal Time Fully Explained",
    date: "March 20, 2025",
    dateIso: "2025-03-20",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "UTC is the world's official time standard — the baseline from which every time zone is defined. Here's what UTC actually is, how it works, and why it matters for software, aviation, and daily life.",
    tags: ["UTC", "Coordinated Universal Time", "time standard", "time zones", "atomic clocks"],
  },
  {
    slug: "australia-time-zones-guide",
    title: "Australia Time Zones: The Complete Guide to AEST, ACST, AWST and More",
    date: "March 21, 2025",
    dateIso: "2025-03-21",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "Australia has five time zones — including two with 30-minute offsets. Learn AEST, ACST, AWST, LHST and when each state observes Daylight Saving Time (and which ones don't).",
    tags: ["Australia", "AEST", "ACST", "AWST", "time zones", "Daylight Saving Time"],
  },
  {
    slug: "jet-lag-tips-cross-timezone-travel",
    title: "Jet Lag Tips: How to Beat Time Zone Fatigue When Travelling",
    date: "March 21, 2025",
    dateIso: "2025-03-21",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "Jet lag is your body clock fighting the time zone you've just entered. Here's the science behind it and the practical strategies that actually help you recover faster.",
    tags: ["jet lag", "travel", "time zones", "sleep", "circadian rhythm"],
  },
  {
    slug: "gmt-to-ist-conversion-guide",
    title: "GMT to IST: The Complete Conversion Guide for India-UK Time",
    date: "March 22, 2025",
    dateIso: "2025-03-22",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "IST is 5.5 hours ahead of GMT — or 4.5 hours ahead of BST in summer. The full guide to GMT to IST conversion with tables, scheduling tips, and DST pitfalls.",
    tags: ["GMT", "IST", "India UK time", "time zone conversion", "GMT to IST"],
  },
  {
    slug: "how-time-zones-were-invented",
    title: "How Time Zones Were Invented: The Story Behind the 1884 Prime Meridian Conference",
    date: "March 22, 2025",
    dateIso: "2025-03-22",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "Before 1884, every city kept its own time. The story of how railways, telegraphs, and a Washington DC conference created the global time zone system we still use today.",
    tags: ["time zone history", "1884", "Prime Meridian Conference", "railways", "standard time"],
  },
  {
    slug: "cst-to-est-conversion-guide",
    title: "CST to EST: Central to Eastern Time Conversion Guide",
    date: "March 23, 2025",
    dateIso: "2025-03-23",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "CST is 1 hour behind EST. Here's the complete guide to converting Central Standard Time to Eastern Standard Time — with tables, DST notes, and which US cities use each zone.",
    tags: ["CST", "EST", "Central Time", "Eastern Time", "US time zones"],
  },
  {
    slug: "best-world-clock-tools-comparison",
    title: "The Best World Clock Tools in 2025 (And What to Look For)",
    date: "March 23, 2025",
    dateIso: "2025-03-23",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "The best world clock tools do more than show the time — they handle DST automatically, show overlap windows, and convert between any two time zones instantly. Here's what to look for.",
    tags: ["world clock", "time zone converter", "tools", "remote work", "scheduling"],
  },
  {
    slug: "what-time-zone-is-london",
    title: "What Time Zone Is London? GMT, BST, and Why It Changes Twice a Year",
    date: "April 1, 2025",
    dateIso: "2025-04-01",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "London doesn't stay in one time zone year-round. Here's why it switches between GMT and BST, what that means for international scheduling, and how to always get it right.",
    tags: ["London time zone", "GMT", "BST", "British Summer Time", "UK time", "what time is it in London"],
  },
  {
    slug: "time-difference-between-usa-and-india",
    title: "Time Difference Between USA and India: Every State, Every Season",
    date: "April 4, 2025",
    dateIso: "2025-04-04",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "The US-India time difference isn't simple — it varies by US state, by season, and always ends on a half-hour. The complete reference guide for every combination.",
    tags: ["USA India time difference", "IST to EST", "IST to PST", "India US time", "IST time difference"],
  },
  {
    slug: "what-is-pst-pacific-standard-time",
    title: "What Is PST? The Complete Guide to Pacific Standard Time",
    date: "April 7, 2025",
    dateIso: "2025-04-07",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "PST powers Silicon Valley, Hollywood, and the Pacific Northwest. Here's everything about Pacific Standard Time — UTC offset, which states use it, and how it compares globally.",
    tags: ["PST", "Pacific Standard Time", "Pacific Time", "UTC-8", "California time zone", "what is PST"],
  },
  {
    slug: "new-york-to-dubai-time-difference",
    title: "New York to Dubai Time Difference: The Complete Guide",
    date: "April 9, 2025",
    dateIso: "2025-04-09",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "New York to Dubai is a 9-hour gap in winter and 8 hours in summer. Here's the complete guide — conversion table, business overlap, DST impact, and scheduling tips.",
    tags: ["New York Dubai time", "EST to GST", "NYC Dubai time difference", "US UAE time", "Dubai time zone"],
  },
  {
    slug: "sydney-to-london-time-difference",
    title: "Sydney to London Time Difference: What You Need to Know Year-Round",
    date: "April 11, 2025",
    dateIso: "2025-04-11",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "The Sydney to London time gap shifts seasonally and is rarely the same number twice. Here's the complete year-round guide with conversion table, overlap hours, and DST calendar.",
    tags: ["Sydney London time", "AEST GMT", "Australia UK time difference", "Sydney to London", "Australian time UK"],
  },
  {
    slug: "ist-to-pst-complete-guide",
    title: "IST to PST: India to California Time Conversion Guide",
    date: "April 14, 2025",
    dateIso: "2025-04-14",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "IST to PST: India is 12.5 or 13.5 hours ahead of California depending on the season. The complete guide with conversion table, overlap hours, and tips for India-US West Coast teams.",
    tags: ["IST to PST", "India California time", "IST PST difference", "India Silicon Valley time", "IST to PDT"],
  },
  {
    slug: "countries-that-dont-use-daylight-saving-time",
    title: "Countries That Don't Use Daylight Saving Time (And Why They're Right)",
    date: "April 16, 2025",
    dateIso: "2025-04-16",
    author: "WorldTimeSuite Editorial",
    metaDescription:
      "Most of the world's countries don't change their clocks. Here's which countries skip DST, why they dropped it, and the growing global movement to abolish it for good.",
    tags: ["countries without DST", "no daylight saving time", "countries that don't change clocks", "DST abolish"],
  },
];

export const BLOG_POST_META_BY_SLUG: Record<string, BlogPostMeta> = Object.fromEntries(
  BLOG_POSTS_META.map(p => [p.slug, p])
);
