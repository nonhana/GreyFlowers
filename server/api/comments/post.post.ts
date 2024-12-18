import dayjs from 'dayjs'
import { z } from 'zod'
import prisma from '~/lib/prisma'
import { useZodVerify } from '~/server/composables/useZodVerify'

const verifySchema = z.object({
  path: z.string(),
  content: z.string().min(1, { message: 'Content must not be empty' }).max(2048, { message: 'Content must not exceed 2048 characters' }),
  parentId: z.number().int().optional(),
  replyToUserId: z.number().int().optional(),
  replyToCommentId: z.number().int().optional(),
})

export default formattedEventHandler(async (event) => {
  const id = event.context.jwtPayload.id
  const body = await readBody(event)
  const { success, errorList, result } = useZodVerify(verifySchema, body)
  if (!success) {
    return {
      statusCode: 400,
      statusMessage: 'Invalid request body',
      error: errorList,
      success: false,
    }
  }

  const {
    path,
    content,
    parentId,
    replyToUserId,
    replyToCommentId,
  } = result

  const newItem = await prisma.comment.create({
    data: {
      path,
      content,
      level: parentId ? 'CHILD' : 'PARENT',
      parentId,
      authorId: id,
      replyToUserId,
      replyToCommentId,
    },
    select: {
      id: true,
      path: true,
      content: true,
      level: true,
      author: { select: { id: true, username: true, site: true, avatar: true } },
      parent: { select: { id: true, content: true, author: { select: { id: true, username: true, site: true, avatar: true } } } },
      replyToUser: { select: { id: true, username: true } },
      replyToComment: { select: { id: true, content: true } },
      publishedAt: true,
      editedAt: true,
    },
  })

  const formattedItem = {
    ...newItem!,
    publishedAt: dayjs(newItem!.publishedAt).format('YYYY-MM-DD HH:mm:ss'),
    editedAt: dayjs(newItem!.editedAt).format('YYYY-MM-DD HH:mm:ss'),
  }

  return { payload: formattedItem }
})
