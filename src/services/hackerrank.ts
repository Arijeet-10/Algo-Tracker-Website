/**
 * Represents a HackerRank user.
 */
export interface HackerRankUser {
  /**
   * The user's username.
   */
  username: string;
  /**
   * The user's number of problems solved.
   */
  problemsSolved: number;
}

/**
 * Represents a HackerRank submission.
 */
export interface HackerRankSubmission {
  /**
   * The problem code.
   */
  problemCode: string;
  /**
   * The submission status (e.g., accepted, wrong).
   */
  status: string;
  /**
   * The submission date.
   */
  submissionDate: string;
}

const HACKERRANK_API_URL = 'https://hackerrank.com/api/v3'; // Replace with the actual API endpoint

/**
 * Asynchronously retrieves a HackerRank user's information.
 *
 * @param username The HackerRank user's username.
 * @returns A promise that resolves to a HackerRankUser object.
 */
export async function getHackerRankUser(username: string): Promise<HackerRankUser | null> {
  try {
    // Call a 3rd party hackerrank API since Hackerrank does not expose a public API.
    const response = await fetch(`https://cp-api.onrender.com/hackerrank/${username}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.user === null) {
      return null;
    }
    return {
      username: data.user.username,
      problemsSolved: data.user.solved,
    };
  } catch (error) {
    console.error("Failed to fetch HackerRank user:", error);
    return null;
  }
}

/**
 * Asynchronously retrieves a HackerRank user's recent submissions.
 *
 * @param username The HackerRank user's username.
 * @param limit The number of submissions to retrieve.
 * @returns A promise that resolves to an array of HackerRankSubmission objects.
 */
export async function getHackerRankSubmissions(
  username: string,
  limit: number
): Promise<HackerRankSubmission[]> {
   try {
    const response = await fetch(`https://cp-api.onrender.com/hackerrank/${username}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      console.log('Not OK');
      return [];
    }
    const data = await response.json();
     if (data.submissions === null) {
      return [];
    }
    return data.submissions.slice(0, limit).map((submission: any) => ({
      problemCode: submission.problemCode,
      status: submission.status,
      submissionDate: submission.date,
    }));
  } catch (error) {
    console.error("Failed to fetch HackerRank submissions:", error);
    return [];
  }
}
