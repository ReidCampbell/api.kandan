import { ObjectType, Field } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
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

  @Field()
  @Column()
  creatorId: number;

  // @Field(() => User)
  // @OneToMany(
  //   () => User,
  //   user => user.board
  // )
  // users: User[];

  @Field(() => [KandanColumn], { nullable: true })
  @OneToMany(
    () => KandanColumn,
    kandanColumn => kandanColumn.board
  )
  kandanColumns: KandanColumn[];
}
