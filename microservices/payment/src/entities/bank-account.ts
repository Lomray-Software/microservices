import { Allow } from 'class-validator';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  @Allow()
  id: string;
}

export default BankAccount;
