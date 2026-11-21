import CommentPage from "@/app/(commonLayout)/comment/page"

type PageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

export default function UserDashboardCommentPage({ searchParams }: PageProps) {
  return <CommentPage searchParams={searchParams} />
}

