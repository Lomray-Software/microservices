import { IsUndefinable } from '@lomray/microservice-helpers';
import { Allow, IsObject, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['microservice', 'type'])
class Config<TParams = Record<string, any>> {
  @PrimaryGeneratedColumn()
  @Allow()
  id: number;

  /**
   * This field can be '*', it means - for all microservices
   */
  @Column({ type: 'varchar', length: 50 })
  @Length(1, 50)
  microservice: string;

  /**
   * db, aws, mail, microservice (personal configs) and etc.
   */
  @Column({ type: 'varchar', length: 30 })
  @Length(1, 30)
  type: string;

  @Column({ type: 'json', default: {} })
  @IsObject()
  @IsUndefinable()
  params: TParams;
}

export default Config;
