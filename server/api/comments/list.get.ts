import type { CommentListQuery } from '~/server/types/comments'
import dayjs from 'dayjs'
import prisma from '~/lib/prisma'
import { commentSelectObj } from '~/server/utils/prismaShortcut'

async function getComments(path: string, page: number, pageSize: number) {
  const comments = await prisma.comment.findMany({
    where: { path, level: 'PARENT' },
    select: {
      ...commentSelectObj,
      children: { select: { ...commentSelectObj }, orderBy: { publishedAt: 'asc' } },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { publishedAt: 'desc' },
  })
  const result = comments.map(comment => ({
    ...comment,
    publishedAt: dayjs(comment.publishedAt).format('YYYY-MM-DD HH:mm:ss'),
    editedAt: dayjs(comment.editedAt).format('YYYY-MM-DD HH:mm:ss'),
    children: comment.children.map(child => ({
      ...child,
      publishedAt: dayjs(child.publishedAt).format('YYYY-MM-DD HH:mm:ss'),
      editedAt: dayjs(child.editedAt).format('YYYY-MM-DD HH:mm:ss'),
    })),
  }))
  return result
}

export default formattedEventHandler(async (event) => {
  const query = getQuery(event) as CommentListQuery
  const page = Number.parseInt(query.page as string) || 1
  const pageSize = Number.parseInt(query.pageSize as string) || 6
  const path = query.path as string
  const comments = await getComments(path, page, pageSize)
  return { payload: comments }
})
