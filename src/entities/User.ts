import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Comment } from './Comment';
import { Ticket } from './Ticket';
import { Board } from './Board';

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

  @ManyToMany(
    () => Board,
    board => board.users
  )
  boards: Board[];

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
