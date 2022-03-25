import { IsRFC3339, Length } from 'class-validator';
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
  @IsRFC3339() // timestamp validator
  expirationAt: number;

  @CreateDateColumn()
  createdAt: Date;
}

export default ConfirmCode;
