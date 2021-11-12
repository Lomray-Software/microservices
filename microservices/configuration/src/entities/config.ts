import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['microservice', 'type'])
class Config<TParams = Record<string, any>> {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * This field can be '*', it means - for all microservices
   */
  @Column({
    length: 50,
  })
  microservice: string;

  /**
   * db, aws, mail, microservice (personal configs) and etc.
   */
  @Column({
    length: 30,
  })
  type: string;

  @Column({ type: 'json', default: {} })
  params: TParams;
}

export default Config;
