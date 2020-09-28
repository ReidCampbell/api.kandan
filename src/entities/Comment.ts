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
import { Post } from './Post';

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
  @Column({ type: 'int', default: 0 })
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @Column()
  postId: number;

  @Field(() => User)
  @OneToMany(
    () => User,
    user => user.posts
  )
  creator: User;

  @Field(() => Post)
  @ManyToOne(
    () => Post,
    post => post.comments,
    { onDelete: 'CASCADE' }
  )
  post: Post;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null; // 1 or -1 or null

  @OneToMany(
    () => Updoot,
    updoot => updoot.post
  )
  updoots: Updoot[];
}
