/**
 * Represents a processed LeetCode submission.
 */
export interface ProcessedLeetCodeSubmission {
  title: string;
}

/**
 * Represents a LeetCode user.
 */
export interface LeetCodeUser {
  /**
   * The user's username.
   */
  username: string;
  /**
   * The number of problems solved by the user.
   */
  problemsSolved: number;
  /**
   * The number of easy problems solved by the user.
   */
  easySolved?: number;
  /**
   * The number of medium problems solved by the user.
   */
  mediumSolved?: number;
  /**
   * The number of hard problems solved by the user.
   */
  hardSolved?: number;
  /**
   * The total number of questions.
   */
  totalQuestions?: number;
  /**
   * The user's ranking.
   */
  ranking?: number;
}

/**
 * Represents a LeetCode submission.
 */
export interface LeetCodeSubmission {
  /**
   * The problem title.
   */
  problemTitle: string;
  /**
   * The submission status (e.g., Accepted, Wrong Answer).
   */
  status: string;
  /**
   * The timestamp of the submission.
   */
  timestamp: number;
}

const LEETCODE_API_URL = 'https://leetcode.com/graphql/';

/**
 * Asynchronously retrieves a LeetCode user's information.
 *
 * @param username The LeetCode user's username.
 * @returns A promise that resolves to a LeetCodeUser object.
 */
export async function getLeetCodeUser(username: string): Promise<LeetCodeUser | null> {
  try {
    const response = await fetch(`https://leetcode-api-proxy.onrender.com/${username}`);
    if (!response.ok) {
      console.error(`Failed to fetch LeetCode user for ${username}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      username,
      problemsSolved: data.totalSolved,
      easySolved: data.easySolved,
      mediumSolved: data.mediumSolved,
      hardSolved: data.hardSolved,
      totalQuestions: data.totalQuestions,
      ranking: data.ranking,
    };
  } catch (error) {
    console.error("Failed to fetch LeetCode user:", error);
    return null;
  }
}


/**
 * Asynchronously retrieves a LeetCode user's recent submissions.
 *
 * @param username The LeetCode user's username.
 * @param limit The number of submissions to retrieve.
 * @returns A promise that resolves to an array of LeetCodeSubmission objects.
 */
export async function getLeetCodeSubmissions(username: string): Promise<LeetCodeSubmission[]> {
  try {
    const response = await fetch(`https://leetcode-api-proxy.onrender.com/${username}`);
    if (!response.ok) {
      console.error(`Failed to fetch LeetCode submissions for ${username}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const submissions = data.recentSubmissions;

    if (!submissions || !Array.isArray(submissions)) {
      return [];
    }

    return submissions.map((submission: any) => ({
      problemTitle: submission.title,
      status: submission.statusDisplay,
      timestamp: Number(submission.timestamp),
    }));
  } catch (error) {
    console.error("Failed to fetch LeetCode submissions:", error);
    return [];
  }
}
