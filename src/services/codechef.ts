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

const CODECHEF_API_URL = 'https://codechef-api.vercel.app/handle';

/**
 * Asynchronously retrieves a CodeChef user's information.
 *
 * @param handle The CodeChef user's handle.
 * @returns A promise that resolves to a CodeChefUser object.
 */
export async function getCodeChefUser(handle: string): Promise<CodeChefUser | null> {
  try {
    const response = await fetch(`${CODECHEF_API_URL}/${handle}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();

    if (!data || !data.user_details) {
      return null;
    }

    return {
      username: data.user_details.username,
      rating: data.user_details.rating,
    };
  } catch (error) {
    console.error("Failed to fetch CodeChef user:", error);
    return null;
  }
}

/**
 * Asynchronously retrieves a CodeChef user's recent submissions.
 *
 * @param handle The CodeChef user's handle.
 * @param limit The number of submissions to retrieve.
 * @returns A promise that resolves to an array of CodeChefSubmission objects.
 */
export async function getCodeChefSubmissions(
  handle: string,
  limit: number
): Promise<CodeChefSubmission[]> {
  try {
    const response = await fetch(`${CODECHEF_API_URL}/${handle}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      console.log('Not OK');
      return [];
    }
    const data = await response.json();

    if (!data || !data.recent_submissions) {
      return [];
    }

    return data.recent_submissions.slice(0, limit).map((submission: any) => ({
      problemCode: submission.problem_code,
      status: submission.status,
      submissionDate: submission.submission_date,
    }));
  } catch (error) {
    console.error("Failed to fetch CodeChef submissions:", error);
    return [];
  }
}
