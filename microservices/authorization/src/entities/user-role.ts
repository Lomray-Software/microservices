import { IsTypeormDate } from '@lomray/microservice-helpers';
import { Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { CreateDateColumn, Entity, UpdateDateColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import Role from '@entities/role';

@JSONSchema({
  properties: {
    role: { $ref: '#/definitions/Role' },
  },
})
@Entity()
class UserRole {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  @Length(1, 36)
  userId: string;

  @PrimaryColumn({ type: 'varchar', length: 30 })
  @Length(3, 30)
  roleAlias: string;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  role: Role;
}

export default UserRole;
