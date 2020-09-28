import { ObjectType, Field, Int } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Updoot } from './Updoot';
import { User } from './User';
import { Comment } from './Comment';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
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
  text!: string;

  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @Field(() => User)
  @ManyToOne(
    () => User,
    user => user.posts
  )
  creator: User;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null; // 1 or -1 or null

  @OneToMany(
    () => Updoot,
    updoot => updoot.post
  )
  updoots: Updoot[];

  @Field(() => [Comment], { nullable: true })
  @OneToMany(
    () => Comment,
    comment => comment.post
  )
  comments: Comment[];
}
