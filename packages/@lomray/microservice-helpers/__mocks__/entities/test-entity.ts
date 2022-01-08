import { Allow, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class TestEntity {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @Column()
  @Length(1, 50)
  param: string;
}

export default TestEntity;
