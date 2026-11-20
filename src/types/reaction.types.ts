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

export type ReactionCountGroup = {
  type: ContentReactionType
  _count: { _all: number }
}

export type ReactionActionResult = {
  success: boolean
  message: string
  counts?: ReactionCounts
}

export type ReactionSummary = {
  type: ContentReactionType
}

export const createEmptyReactionCounts = (): ReactionCounts => ({
  LIKE: 0,
  DISLIKE: 0,
  LOVE: 0,
  LAUGH: 0,
  WOW: 0,
  SAD: 0,
  ANGRY: 0,
})

export const mapReactionCounts = (
  reactionCounts: ReactionCountGroup[],
): ReactionCounts => {
  const counts = createEmptyReactionCounts()
  for (const reaction of reactionCounts) {
    counts[reaction.type] = reaction._count._all
  }
  return counts
}
