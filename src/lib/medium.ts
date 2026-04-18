/**
 * Utility to fetch Medium blogs via RSS-to-JSON API at build time.
 */

export interface MediumPost {
  title: string;
  link: string;
  thumbnail: string;
  pubDate: string;
  description: string;
}

export async function getMediumPosts(): Promise<MediumPost[]> {
  const RSS_URL = "https://medium.com/feed/@blitzbugg";
  const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${RSS_URL}`;

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error("Failed to fetch Medium feed");
    }

    return data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      thumbnail: item.thumbnail || extractThumbnail(item.description) || "",
      pubDate: formatDate(item.pubDate),
      description: sanitizeDescription(item.description),
    }));
  } catch (error) {
    console.error("Error fetching Medium posts:", error);
    return [];
  }
}

/**
 * Extracts the first image URL from HTML content if the thumbnail field is empty.
 */
function extractThumbnail(html: string): string | null {
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

/**
 * Strips HTML tags and trims description.
 */
function sanitizeDescription(html: string): string {
  // Remove all HTML tags
  const text = html.replace(/<[^>]*>?/gm, '');
  // Decode basic HTML entities and clean up whitespace
  const cleanText = text
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleanText.length > 180 ? cleanText.substring(0, 180) + '...' : cleanText;
}

/**
 * Formats date to 'MMM YYYY' format.
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}
