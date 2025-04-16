/**
 * Represents a Codeforces user.
 */
export interface CodeforcesUser {
  /**
   * The user's handle.
   */
  handle: string;
  /**
   * The user's rating.
   */
  rating: number;
}

/**
 * Represents a Codeforces submission.
 */
export interface CodeforcesSubmission {
  /**
   * The submission ID.
   */
  id: number;
  /**
   * The problem name.
   */
  problemName: string;
  /**
   * The submission status (e.g., OK, WRONG_ANSWER).
   */
  status: string;
  /**
   * The submission time in seconds since epoch.
   */
  submissionTimeSeconds: number;
}

const CODEFORCES_API_URL = 'https://codeforces.com/api';

/**
 * Asynchronously retrieves a Codeforces user's information.
 *
 * @param handle The Codeforces user's handle.
 * @returns A promise that resolves to a CodeforcesUser object.
 */
export async function getCodeforcesUser(handle: string): Promise<CodeforcesUser | null> {
  try {
    const response = await fetch(`${CODEFORCES_API_URL}/user.info?handles=${handle}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.status !== 'OK' || !data.result || data.result.length === 0) {
      return null;
    }
    const user = data.result[0];
    return {
      handle: user.handle,
      rating: user.rating,
    };
  } catch (error) {
    console.error("Failed to fetch Codeforces user:", error);
    return null;
  }
}

/**
 * Asynchronously retrieves a Codeforces user's recent submissions.
 *
 * @param handle The Codeforces user's handle.
 * @param count The number of submissions to retrieve.
 * @returns A promise that resolves to an array of CodeforcesSubmission objects.
 */
export async function getCodeforcesSubmissions(
  handle: string,
  count: number
): Promise<CodeforcesSubmission[]> {
  try {
    const response = await fetch(
      `${CODEFORCES_API_URL}/user.status?handle=${handle}&from=1&count=${count}`
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();

    if (data.status !== 'OK' || !data.result) {
      return [];
    }

    return data.result.map((submission: any) => ({
      id: submission.id,
      problemName: submission.problem.name,
      status: submission.verdict,
      submissionTimeSeconds: submission.creationTimeSeconds,
    }));
  } catch (error) {
    console.error("Failed to fetch Codeforces submissions:", error);
    return [];
  }
}

    