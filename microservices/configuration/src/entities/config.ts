import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsObject, Length } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['microservice', 'type'])
class Config<TParams = Record<string, any>> {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  @JSONSchema({
    description: "This field can be '*', it means - for all microservices",
  })
  @Column({ type: 'varchar', length: 50 })
  @Length(1, 50)
  microservice: string;

  @JSONSchema({
    example: 'db, aws, mail, microservice (personal configs) etc.',
  })
  @Column({ type: 'varchar', length: 30 })
  @Length(1, 30)
  type: string;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: TParams;

  @IsTypeormDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsTypeormDate()
  @UpdateDateColumn()
  updatedAt: Date;
}

export default Config;
