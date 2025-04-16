/**
 * Represents a CodeChef user.
 */
export interface CodeChefUser {
  /**
   * The user's username.
   */
  username: string;
  /**
   * The user's rating.
   */
  rating: number;
}

/**
 * Represents a CodeChef submission.
 */
export interface CodeChefSubmission {
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

const CODECHEF_API_URL = 'https://codechef.com/api/ratings/'; // Replace with the actual API endpoint

/**
 * Asynchronously retrieves a CodeChef user's information.
 *
 * @param username The CodeChef user's username.
 * @returns A promise that resolves to a CodeChefUser object.
 */
export async function getCodeChefUser(username: string): Promise<CodeChefUser | null> {
  try {
    // Call a 3rd party codechef API since Codechef does not expose a public API.
    const response = await fetch(`https://cp-api.onrender.com/codechef/${username}`, {
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
      rating: data.user.currentRating,
    };
  } catch (error) {
    console.error("Failed to fetch CodeChef user:", error);
    return null;
  }
}

/**
 * Asynchronously retrieves a CodeChef user's recent submissions.
 *
 * @param username The CodeChef user's username.
 * @param limit The number of submissions to retrieve.
 * @returns A promise that resolves to an array of CodeChefSubmission objects.
 */
export async function getCodeChefSubmissions(
  username: string,
  limit: number
): Promise<CodeChefSubmission[]> {
   try {
    const response = await fetch(`https://cp-api.onrender.com/codechef/${username}`, {
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
      status: submission.result,
      submissionDate: submission.date,
    }));
  } catch (error) {
    console.error("Failed to fetch CodeChef submissions:", error);
    return [];
  }
}

    
