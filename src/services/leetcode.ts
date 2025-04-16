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
    const response = await fetch(`https://leetcode-api-proxy.onrender.com/user/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      const errorBody = await response.text();
      console.error(`Failed to fetch LeetCode user for ${username}: ${response.status} ${response.statusText} - ${errorBody}`);
      return null;
    }

    const data = await response.json();

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
    const response = await fetch(`https://leetcode-api-proxy.onrender.com/user/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
        console.error(`Failed to fetch LeetCode submissions for ${username}: ${response.status} ${response.statusText}`);
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

