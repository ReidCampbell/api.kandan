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
import { Comment } from './Comment';

@ObjectType()
@Entity()
export class Reply extends BaseEntity {
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
  commentId: number;

  @Field(() => User)
  @OneToMany(
    () => User,
    user => user.posts
  )
  creator: User;

  @Field(() => Comment)
  @ManyToOne(
    () => Comment,
    comment => comment.replies,
    { onDelete: 'CASCADE' }
  )
  comment: Comment;

  // @Field(() => Int, { nullable: true })
  // voteStatus: number | null; // 1 or -1 or null

  // @OneToMany(
  //   () => Updoot,
  //   updoot => updoot.comment
  // )
  // updoots: Updoot[];
}
