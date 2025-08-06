// This function will handle all our API requests
export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error("API URL is not configured!");
  }

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      // Default options can be set here, like headers
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // If the server responds with a non-2xx status, we throw an error
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    console.error("API fetcher error:", error);
    throw error; // Re-throw the error to be handled by the component
  }
}