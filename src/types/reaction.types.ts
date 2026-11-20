export const CONTENT_REACTION_TYPES = [
  "LIKE",
  "DISLIKE",
  "LOVE",
  "LAUGH",
  "WOW",
  "SAD",
  "ANGRY",
] as const

export type ContentReactionType = (typeof CONTENT_REACTION_TYPES)[number]

export type ReactionCounts = Record<ContentReactionType, number>

export type ReviewReactionSummary = {
  type: ContentReactionType
}
