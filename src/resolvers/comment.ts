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
import { Comment } from '../entities/Comment';
import { getConnection } from 'typeorm';
import { User } from '../entities/User';
import { Ticket } from '../entities/Ticket';

@ObjectType()
class PaginatedComments {
  @Field(() => [Comment])
  comments: Comment[];
  @Field()
  hasMore: boolean;
}

@Resolver(Comment)
export class CommentResolver {
  @FieldResolver(() => User)
  creator(@Root() comment: Comment, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(comment.creatorId);
  }

  @FieldResolver(() => Ticket)
  ticket(@Root() comment: Comment, @Ctx() { ticketLoader }: MyContext) {
    return ticketLoader.load(comment.ticketId);
  }

  @Query(() => PaginatedComments)
  async comments(
    @Arg('limit', () => Int) limit: number,
    @Arg('ticketId', () => Int) ticketId: number
  ): Promise<PaginatedComments> {
    const realLimit = Math.min(10, limit);
    const realLimitPlusOne = realLimit + 1;

    const comments = await getConnection().query(
      `
      select p.*
      from comment p
      where p."ticketId" = $1
      order by p."createdAt" DESC
      limit $1
    `,
      [ticketId]
    );

    return {
      comments: comments.slice(0, realLimit),
      hasMore: comments.length === realLimitPlusOne,
    };
  }

  @Query(() => Comment, { nullable: true })
  comment(@Arg('id', () => Int) id: number): Promise<Comment | undefined> {
    return Comment.findOne(id);
  }

  @Mutation(() => Comment)
  @UseMiddleware(isAuth)
  async createComment(
    @Arg('ticketId', () => Int) ticketId: number,
    @Arg('text', () => String) text: string,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;
    return Comment.create({ text, creatorId: userId, ticketId }).save();
  }

  @Mutation(() => Comment, { nullable: true })
  @UseMiddleware(isAuth)
  async updateComment(
    @Arg('id', () => Int) id: number,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext
  ): Promise<Comment | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Comment)
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
  async deleteComment(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    await Comment.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
