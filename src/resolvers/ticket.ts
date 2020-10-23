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
import { User } from '../entities/User';
import { Comment } from '../entities/Comment';
import { Ticket } from '../entities/Ticket';

@InputType()
class TicketInput {
  @Field()
  title: string;
  @Field()
  description: string;
}

@Resolver(Ticket)
export class TicketResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Ticket) {
    return root.description.slice(0, 150);
  }

  @FieldResolver(() => User)
  creator(@Root() ticket: Ticket, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(ticket.creatorId);
  }

  @FieldResolver(() => [Comment])
  async comments(@Root() ticket: Ticket) {
    const comments = await getConnection().query(
      `
      select p.*
      from comment p
      where p."ticketId" = $1
      order by p."createdAt" ASC
    `,
      [ticket.id]
    );
    return comments;
  }

  @Query(() => [Ticket])
  async tickets(
    @Arg('kandanColumnId', () => Int) kandanColumnId: number
  ): Promise<Ticket[]> {
    return Ticket.find({ where: { kandanColumnId } });
  }

  @Query(() => Ticket, { nullable: true })
  ticket(@Arg('id', () => Int) id: number): Promise<Ticket | undefined> {
    return Ticket.findOne(id);
  }

  @Mutation(() => Ticket)
  @UseMiddleware(isAuth)
  async createTicket(
    @Arg('input') input: TicketInput,
    @Ctx() { req }: MyContext
  ): Promise<Ticket> {
    if (!req.session.userId) {
      throw new Error('Not authenticated');
    }
    return Ticket.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Ticket, { nullable: true })
  @UseMiddleware(isAuth)
  async updateTicket(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') description: string,
    @Ctx() { req }: MyContext
  ): Promise<Ticket | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Ticket)
      .set({ title, description })
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
  async deleteTicket(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    await Ticket.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
