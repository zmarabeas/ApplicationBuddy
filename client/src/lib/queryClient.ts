import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get Firebase auth token
async function getFirebaseToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.log("No current Firebase user found");
    return null;
  }
  
  try {
    console.log("Getting Firebase token for user:", user.email);
    const token = await user.getIdToken(true);
    console.log("Firebase token obtained, length:", token.length);
    return token;
  } catch (error) {
    console.error("Error getting Firebase token:", error);
    return null;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  headersOnly: boolean = false
): Promise<Response | Record<string, string>> {
  // Get Firebase token
  const firebaseToken = await getFirebaseToken();
  
  // Prepare headers
  const headers: Record<string, string> = {};
  if (data && !headersOnly) {
    headers["Content-Type"] = "application/json";
  }
  if (firebaseToken) {
    headers["Authorization"] = `Bearer ${firebaseToken}`;
  }
  
  // If headersOnly is true, just return the headers
  if (headersOnly) {
    return headers;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get Firebase token
    const firebaseToken = await getFirebaseToken();
    
    // Prepare headers
    const headers: Record<string, string> = {};
    if (firebaseToken) {
      headers["Authorization"] = `Bearer ${firebaseToken}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
