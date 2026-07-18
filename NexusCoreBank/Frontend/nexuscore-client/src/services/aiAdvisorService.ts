import { authorizedRequest } from "./apiService";

export interface AiAdvisorRequest {
  UserMessage: string;
}

export interface AiAdvisorResponse {
  reply: string;
}

interface RawAiResponse {
  reply?: string;
  Reply?: string;
  message?: string;
  Message?: string;
}

export async function askAiAdvisor(
  userMessage: string,
): Promise<AiAdvisorResponse> {
  const data = await authorizedRequest<RawAiResponse>("/AiChat/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      UserMessage: userMessage,
    } satisfies AiAdvisorRequest),
  });

  const reply = data?.reply ?? data?.Reply ?? data?.message ?? data?.Message;

  if (!reply) {
    throw new Error("NexusAI returned an empty response.");
  }

  return {
    reply,
  };
}
