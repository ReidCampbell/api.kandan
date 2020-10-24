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
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { KandanColumn } from '../entities/KandanColumn';
import { Board } from '../entities/Board';
import { User } from '../entities/User';

@InputType()
class BoardInput {
  @Field()
  title: string;
}

@Resolver(Board)
export class BoardResolver {
  @FieldResolver(() => KandanColumn)
  async kandanColumns(@Root() board: Board) {
    const kandanColumns = await getConnection().query(
      `
      select p.*
      from kandan_column p
      where p."boardId" = $1
      order by p."createdAt" ASC
    `,
      [board.id]
    );
    return kandanColumns;
  }

  @FieldResolver(() => User)
  creator(@Root() board: Board, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(board.creatorId);
  }

  // @Query(() => [Board])
  // async boards(
  //   @Arg('boardId', () => Int) boardId: number
  // ): Promise<Ticket[]> {
  //   return Ticket.find({ where: { boardId } });
  // }

  @Query(() => Board, { nullable: true })
  board(@Arg('id', () => Int) id: number): Promise<Board | undefined> {
    return Board.findOne(id);
  }

  @Mutation(() => Board)
  @UseMiddleware(isAuth)
  async createBoard(
    @Arg('input') input: BoardInput,
    @Ctx() { req }: MyContext
  ): Promise<Board> {
    if (!req.session.userId) {
      throw new Error('Not authenticated');
    }
    return Board.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Board, { nullable: true })
  @UseMiddleware(isAuth)
  async updateBoard(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string
  ): Promise<Board | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Board)
      .set({ title })
      .where('id = :id', {
        id,
      })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteBoard(@Arg('id', () => Int) id: number): Promise<Boolean> {
    await Board.delete({ id });
    return true;
  }
}
