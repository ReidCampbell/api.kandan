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
import { Ticket } from '../entities/Ticket';
import { KandanColumn } from '../entities/KandanColumn';

@InputType()
class KandanColumnInput {
  @Field()
  title: string;
}

@Resolver(KandanColumn)
export class KandanColumnResolver {
  @FieldResolver(() => Ticket)
  async tickets(@Root() kandanColumn: KandanColumn) {
    const tickets = await getConnection().query(
      `
      select p.*
      from ticket p
      where p."kandanColumnId" = $1
      order by p."createdAt" ASC
    `,
      [kandanColumn.id]
    );
    return tickets;
  }

  @Query(() => [KandanColumn])
  async kandanColumns(
    @Arg('boardId', () => Int) boardId: number
  ): Promise<Ticket[]> {
    return Ticket.find({ where: { boardId } });
  }

  @Query(() => KandanColumn, { nullable: true })
  kandanColumn(
    @Arg('id', () => Int) id: number
  ): Promise<KandanColumn | undefined> {
    return KandanColumn.findOne(id);
  }

  @Mutation(() => KandanColumn)
  @UseMiddleware(isAuth)
  async createKandanColumn(
    @Arg('input') input: KandanColumnInput,
    @Ctx() { req }: MyContext
  ): Promise<KandanColumn> {
    if (!req.session.userId) {
      throw new Error('Not authenticated');
    }
    return KandanColumn.create({ ...input }).save();
  }

  @Mutation(() => KandanColumn, { nullable: true })
  @UseMiddleware(isAuth)
  async updateKandanColumn(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string
  ): Promise<KandanColumn | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(KandanColumn)
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
  async deleteKandanColumn(@Arg('id', () => Int) id: number): Promise<Boolean> {
    await KandanColumn.delete({ id });
    return true;
  }
}
