import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Field,
  Ctx,
  InputType,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from 'type-graphql';
import { Comment } from '../entities/Comment';
import { getConnection } from 'typeorm';
import { Updoot } from '../entities/Updoot';
import { User } from '../entities/User';
import { Post } from '../entities/Post';

@InputType()
class CommentInput {
  @Field()
  text: string;
}

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

  @FieldResolver(() => Post)
  post(@Root() comment: Comment, @Ctx() { postLoader }: MyContext) {
    return postLoader.load(comment.postId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() comment: Comment,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const updoot = await updootLoader.load({
      commentId: comment.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('commentId', () => Int) commentId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { commentId, userId } });

    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async tm => {
        await tm.query(
          `update updoot
          set value = $1
          where "commentId" = $2 and "userId" = $3
          `,
          [realValue, commentId, userId]
        );

        await tm.query(
          `update comment
          set points = points + $1
          where id = $2`,
          [2 * realValue, commentId]
        );
      });
    } else if (!updoot) {
      await getConnection().transaction(async tm => {
        await tm.query(
          `insert into updoot ("userId", "commentId", value)
          values ($1, $2, $3)`,
          [userId, commentId, realValue]
        );
        await tm.query(
          `update comment
          set points = points + $1
          where id = $2`,
          [realValue, commentId]
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedComments)
  async comments(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedComments> {
    const realLimit = Math.min(50, limit);
    // const realLimitPlusOne = realLimit + 1;
    const realLimitPlusOne = realLimit;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const comments = await getConnection().query(
      `
      select p.*
      from comment p
      ${cursor ? `where p."createdAt" < $2` : ''}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
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
    @Arg('input') input: CommentInput,
    @Ctx() { req }: MyContext
  ): Promise<Comment> {
    if (!req.session.userId) {
      throw new Error('Not authenticated');
    }
    return Comment.create({ ...input, creatorId: req.session.userId }).save();
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
