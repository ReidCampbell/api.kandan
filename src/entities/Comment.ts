import { ObjectType, Field } from 'type-graphql';
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
import { User } from './User';
import { Post } from './Post';
import { Reply } from './Reply';

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
  @Column({ type: 'int', default: 1 })
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

  @Field(() => [Reply], { nullable: true })
  @OneToMany(
    () => Reply,
    reply => reply.comment
  )
  replies: Reply[];

  // @Field(() => Int, { nullable: true })
  // voteStatus: number | null; // 1 or -1 or null

  // @OneToMany(
  //   () => Updoot,
  //   updoot => updoot.comment
  // )
  // updoots: Updoot[];
}
