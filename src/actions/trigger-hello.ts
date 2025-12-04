'use server'

import { helloWorldTask } from "@/trigger/example";

export async function triggerHelloWorld(payload: any) {
  try {
    const handle = await helloWorldTask.trigger(payload);
    
    return {
      success: true,
      jobId: handle.id,
      message: "Task triggered successfully"
    };
  } catch (error) {
    console.error("Failed to trigger task:", error);
    return {
      success: false,
      error: "Failed to trigger task"
    };
  }
}