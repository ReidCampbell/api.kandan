import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';
import { Comment } from './Comment';
import { Ticket } from './Ticket';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  avatar: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  boardId: number;

  // @ManyToOne(
  //   () => Board,
  //   board => board.users
  // )
  // board: Board;

  @OneToMany(
    () => Ticket,
    ticket => ticket.creator
  )
  tickets: Ticket[];

  @OneToMany(
    () => Comment,
    comment => comment.creator
  )
  comments: Comment[];
}
