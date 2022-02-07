import { Length } from 'class-validator';
import { CreateDateColumn, Entity, UpdateDateColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import Role from '@entities/role';

@Entity()
class UserRole {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  @Length(1, 36)
  userId: string;

  @PrimaryColumn({ type: 'varchar', length: 30 })
  @Length(3, 30)
  roleAlias: string;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default UserRole;
