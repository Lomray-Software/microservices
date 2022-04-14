import { IsNullable, IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Length, Allow } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@JSONSchema({
  properties: {
    parent: { $ref: '#/definitions/Role' },
    children: { $ref: '#/definitions/Role', type: 'array' },
  },
})
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

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Role, (role) => role.children, { onDelete: 'SET NULL' })
  parent: Role;

  @OneToMany(() => Role, (role) => role.parent)
  children: Role[];
}

export default Role;
