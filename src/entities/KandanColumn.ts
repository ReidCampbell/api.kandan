import { ObjectType, Field } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Board } from './Board';
import { Ticket } from './Ticket';

@ObjectType()
@Entity()
export class KandanColumn extends BaseEntity {
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
  title!: string;

  @Field(() => Board)
  @OneToMany(
    () => Board,
    board => board.kandanColumns
  )
  board: Board;

  @Field(() => Ticket)
  @OneToMany(
    () => Ticket,
    ticket => ticket.kandanColumnId
  )
  tickets: Ticket;
}
