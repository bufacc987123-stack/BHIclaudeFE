const BACKEND_URL = "http://127.0.0.1:8000";

// 🔹 Chat API
export async function sendChatMessage(message: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_history: [
          {
            role: "human",
            content: message,
            type: "text"
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error("API failed");
    }

    const data = await response.json();

    console.log("API Response:", data);

    return data;

  } catch (error) {
    console.error("API Error:", error);

    return {
      answer: "Server error",
      kpis: [],
      charts: []
    };
  }
}


// 🔹 Upload JSON API
export async function uploadJSON(payload: any) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/upload-json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
}