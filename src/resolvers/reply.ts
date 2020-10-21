import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from 'type-graphql';
import { Reply } from '../entities/Reply';
import { getConnection } from 'typeorm';
import { User } from '../entities/User';

@ObjectType()
class PaginatedReplies {
  @Field(() => [Reply])
  replies: Reply[];
  @Field()
  hasMore: boolean;
}

@Resolver(Reply)
export class ReplyResolver {
  @FieldResolver(() => User)
  creator(@Root() reply: Reply, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(reply.creatorId);
  }

  @FieldResolver(() => Comment)
  comment(
    @Root() reply: Reply,
    @Ctx() { commentLoader, replyLoader }: MyContext
  ) {
    if (reply.commentOrReply === 'comment') {
      return commentLoader.load(reply.commentId);
    }

    return replyLoader.load(reply.commentId);
  }

  // @FieldResolver(() => Int, { nullable: true })
  // async voteStatus(
  //   @Root() reply: Reply,
  //   @Ctx() { updootLoader, req }: MyContext
  // ) {
  //   if (!req.session.userId) {
  //     return null;
  //   }

  //   const updoot = await updootLoader.load({
  //     replyId: reply.id,
  //     userId: req.session.userId,
  //   });

  //   return updoot ? updoot.value : null;
  // }

  // @Mutation(() => Boolean)
  // @UseMiddleware(isAuth)
  // async vote(
  //   @Arg('replyId', () => Int) replyId: number,
  //   @Arg('value', () => Int) value: number,
  //   @Ctx() { req }: MyContext
  // ) {
  //   const isUpdoot = value !== -1;
  //   const realValue = isUpdoot ? 1 : -1;
  //   const { userId } = req.session;

  //   const updoot = await Updoot.findOne({ where: { replyId, userId } });

  //   if (updoot && updoot.value !== realValue) {
  //     await getConnection().transaction(async tm => {
  //       await tm.query(
  //         `update updoot
  //         set value = $1
  //         where "replyId" = $2 and "userId" = $3
  //         `,
  //         [realValue, replyId, userId]
  //       );

  //       await tm.query(
  //         `update reply
  //         set points = points + $1
  //         where id = $2`,
  //         [2 * realValue, replyId]
  //       );
  //     });
  //   } else if (!updoot) {
  //     await getConnection().transaction(async tm => {
  //       await tm.query(
  //         `insert into updoot ("userId", "replyId", value)
  //         values ($1, $2, $3)`,
  //         [userId, replyId, realValue]
  //       );
  //       await tm.query(
  //         `update reply
  //         set points = points + $1
  //         where id = $2`,
  //         [realValue, replyId]
  //       );
  //     });
  //   }

  //   return true;
  // }

  // MIGHT NOT NEED
  @Query(() => PaginatedReplies)
  async replies(
    @Arg('limit', () => Int) limit: number,
    @Arg('commentId', () => Int) commentId: number
  ): Promise<PaginatedReplies> {
    const realLimit = Math.min(10, limit);
    const realLimitPlusOne = realLimit + 1;

    const replies = await getConnection().query(
      `
      select p.*
      from reply p
      where p."commentId" = $1
      order by p."createdAt" DESC
      limit $1
    `,
      [commentId]
    );

    return {
      replies: replies.slice(0, realLimit),
      hasMore: replies.length === realLimitPlusOne,
    };
  }

  @Query(() => Reply, { nullable: true })
  reply(@Arg('id', () => Int) id: number): Promise<Reply | undefined> {
    return Reply.findOne(id);
  }

  @Mutation(() => Reply)
  @UseMiddleware(isAuth)
  async createReply(
    @Arg('commentId', () => Int) commentId: number,
    @Arg('text', () => String) text: string,
    @Arg('commentOrReply', () => String) commentOrReply: string,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;
    return Reply.create({
      text,
      creatorId: userId,
      commentId,
      commentOrReply,
    }).save();
  }

  @Mutation(() => Reply, { nullable: true })
  @UseMiddleware(isAuth)
  async updateReply(
    @Arg('id', () => Int) id: number,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Reply | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Reply)
      .set({ text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteReply(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    await Reply.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
