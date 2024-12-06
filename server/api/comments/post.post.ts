import dayjs from 'dayjs'
import { z } from 'zod'
import prisma from '~/lib/prisma'
import { useZodVerify } from '~/server/composables/useZodVerify'
import { selectCommentObj } from '~/server/prisma/select'

const verifySchema = z.object({
  articlePath: z.string(),
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
    articlePath,
    content,
    parentId,
    replyToUserId,
    replyToCommentId,
  } = result

  const targetArticle = await prisma.article.findUnique({ where: { to: articlePath }, select: { id: true } })
  if (!targetArticle) {
    return {
      statusCode: 404,
      statusMessage: `Article not found by path: ${articlePath}`,
      success: false,
    }
  }

  const { id: newId } = await prisma.comment.create({
    data: {
      articleId: targetArticle.id,
      content,
      level: parentId ? 'CHILD' : 'PARENT',
      parentId,
      authorId: id,
      replyToUserId,
      replyToCommentId,
    },
  })

  const newItem = await prisma.comment.findUnique({
    where: { id: newId },
    select: selectCommentObj,
  })

  const formattedItem = {
    ...newItem!,
    publishedAt: dayjs(newItem!.publishedAt).format('YYYY-MM-DD HH:mm:ss'),
    editedAt: dayjs(newItem!.editedAt).format('YYYY-MM-DD HH:mm:ss'),
  }

  return { payload: formattedItem }
})
