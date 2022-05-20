import { IsTimestamp, IsTypeormDate } from '@lomray/microservice-helpers';
import { Length } from 'class-validator';
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity()
class ConfirmCode {
  @PrimaryColumn()
  @Length(1, 70)
  login: string;

  @Column({ type: 'varchar' })
  @Length(1, 10)
  code: string | number;

  @Column({ type: 'int', width: 10 })
  @IsTimestamp()
  expirationAt: number;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;
}

export default ConfirmCode;
