import { ObjectType, Field } from 'type-graphql';
import {
  Entity,
  BaseEntity,
  ManyToOne,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { KandanColumn } from './KandanColumn';
import { Comment } from './Comment';

@ObjectType()
@Entity()
export class Ticket extends BaseEntity {
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
  description!: string;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @Column()
  kandanColumnId: number;

  @Field(() => User)
  @ManyToOne(
    () => User,
    user => user.tickets
  )
  creator: User;

  @Field(() => KandanColumn)
  @ManyToOne(
    () => KandanColumn,
    kandanColumn => kandanColumn.tickets,
    { onDelete: 'CASCADE' }
  )
  kandanColumn: KandanColumn;

  @Field(() => [Comment], { nullable: true })
  @OneToMany(
    () => Comment,
    comment => comment.ticket,
    { onDelete: 'CASCADE' }
  )
  comments: Comment[];
}
