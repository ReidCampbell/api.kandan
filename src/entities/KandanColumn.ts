import { ObjectType, Field } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  OneToMany,
  ManyToOne,
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

  @Field()
  @Column()
  boardId!: number;

  @Field(() => Board)
  @ManyToOne(
    () => Board,
    board => board.kandanColumns
  )
  board: Board;

  @Field(() => [Ticket], { nullable: true })
  @OneToMany(
    () => Ticket,
    ticket => ticket.kandanColumnId
  )
  tickets: Ticket[];
}
