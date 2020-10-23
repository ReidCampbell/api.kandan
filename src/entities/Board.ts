import { ObjectType, Field } from 'type-graphql';
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
import { User } from './User';
import { KandanColumn } from './KandanColumn';

@ObjectType()
@Entity()
export class Board extends BaseEntity {
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

  @Field(() => User)
  @ManyToMany(
    () => User,
    user => user.boards
  )
  users: User[];

  @Field(() => KandanColumn)
  @OneToMany(
    () => KandanColumn,
    kandanColumn => kandanColumn.board
  )
  kandanColumns: KandanColumn[];
}
