import { Allow, Length } from 'class-validator';
import { Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
class ConnectAccount {
  @PrimaryColumn({ type: 'varchar', length: 18 })
  @Allow()
  connectAccountId: string;

  @Index('IDX_payment_userId', ['userId'])
  @PrimaryColumn({ type: 'varchar', length: 36 })
  @Length(1, 36)
  userId: string;
}

export default ConnectAccount;
