"use server";

import axios from "axios";

import { httpClient } from "@/lib/axios/httpClient";
import type {
  CommentStatus,
  ModerateCommentActionResult,
  ModerateCommentInput,
} from "@/services/comment.services";
import type { ApiErrorResponse } from "@/types/api.types";

const VALID_COMMENT_STATUSES: readonly CommentStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "HIDDEN",
];

export async function moderateCommentAction(
  commentId: string,
  payload: ModerateCommentInput,
): Promise<ModerateCommentActionResult> {
  if (!commentId?.trim()) {
    return { success: false, message: "Comment ID is required." };
  }
  if (!VALID_COMMENT_STATUSES.includes(payload.status)) {
    return { success: false, message: "Please select a valid comment status." };
  }

  try {
    const response = await httpClient.patch<unknown>(
      `/comments/${encodeURIComponent(commentId.trim())}/moderate`,
      { status: payload.status },
    );
    return { success: response.success, message: response.message };
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message ??
          `Comment moderation failed: ${error.message}`,
      };
    }
    console.error("Comment moderation failed:", error);
    return {
      success: false,
      message: "Comment moderation failed due to an unexpected error.",
    };
  }
}
