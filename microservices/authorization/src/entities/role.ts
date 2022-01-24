import { IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import { Length, Allow } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity()
class Role {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  @Length(3, 30)
  @Allow()
  alias: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  @Length(3, 30)
  @IsUndefinable()
  @IsNullable()
  parentAlias: string | null;

  @Column({ type: 'varchar', length: 30 })
  @Length(1, 30)
  name: string;

  @ManyToOne(() => Role, (role) => role.children, { onDelete: 'SET NULL' })
  parent: Role;

  @OneToMany(() => Role, (role) => role.parent)
  children: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default Role;
