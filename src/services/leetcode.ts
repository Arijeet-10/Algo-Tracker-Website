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

const LEETCODE_API_URL = 'https://leetcode.com/api';

/**
 * Asynchronously retrieves a LeetCode user's information.
 *
 * @param username The LeetCode user's username.
 * @returns A promise that resolves to a LeetCodeUser object.
 */
export async function getLeetCodeUser(username: string): Promise<LeetCodeUser | null> {
  try {
    const response = await fetch(`https://leetcode.com/graphql/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://leetcode.com'
      },
      body: JSON.stringify({
        query: `
          query userProfile($username: String!) {
            allQuestionsCount {
                difficulty
                count
            }
            matchedUser(username: $username) {
                username
                problemsSolvedBeatsStats {
                    difficulty
                    percentage
                }
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                }
            }
          }
        `,
        variables: { username },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    console.log('LeetCode user data:', data);

    if (!data.data?.matchedUser) {
      return null;
    }

    const userProfile = data.data.matchedUser;
    const problemsSolved = userProfile.submitStats.acSubmissionNum.reduce(
        (sum: number, submission: { count: number }) => sum + submission.count,
        0
      );
    return {
      username: userProfile.username,
      problemsSolved: problemsSolved,
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
export async function getLeetCodeSubmissions(
  username: string,
  limit: number
): Promise<LeetCodeSubmission[]> {
  try {
    const response = await fetch(`https://leetcode.com/graphql/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://leetcode.com'
      },
      body: JSON.stringify({
        query: `
            query RecentSubmissions($username: String!, $limit: Int!) {
                recentSubmissionList(username: $username, limit: $limit) {
                    title
                    statusDisplay
                    timestamp
                }
            }
        `,
        variables: {
            username: username,
            limit: limit
        }
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.data?.recentSubmissionList) {
      return [];
    }

    return data.data.recentSubmissionList.map((submission: any) => ({
      problemTitle: submission.title,
      status: submission.statusDisplay,
      timestamp: submission.timestamp,
    }));
  } catch (error) {
    console.error("Failed to fetch LeetCode submissions:", error);
    return [];
  }
}
