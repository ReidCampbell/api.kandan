import { ObjectType, Field } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Ticket } from './Ticket';

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @Column()
  ticketId: number;

  @Field(() => User)
  @ManyToOne(
    () => User,
    user => user.comments
  )
  creator: User;

  @Field(() => Ticket)
  @ManyToOne(
    () => Ticket,
    ticket => ticket.comments,
    { onDelete: 'CASCADE' }
  )
  ticket: Ticket;
}
