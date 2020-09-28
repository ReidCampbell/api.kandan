import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Post } from './Post';
import { Updoot } from './Updoot';
import { Comment } from './Comment';

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

  @OneToMany(
    () => Post,
    post => post.creator
  )
  posts: Post[];

  @OneToMany(
    () => Comment,
    comment => comment.creator
  )
  comments: Comment[];

  @OneToMany(
    () => Updoot,
    updoot => updoot.user
  )
  updoots: Updoot[];
}
