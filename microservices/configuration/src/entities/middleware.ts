import { MiddlewareType } from '@lomray/microservice-nodejs-lib';
import type {
  IMiddlewareEntity,
  IRemoteMiddlewareReqParams,
} from '@lomray/microservice-remote-middleware';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['sender', 'senderMethod', 'target', 'targetMethod', 'type'])
class Middleware implements IMiddlewareEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 30,
  })
  sender: string;

  @Column({
    length: 30,
  })
  senderMethod: string;

  @Column({
    length: 30,
  })
  target: string;

  @Column({
    length: 30,
  })
  targetMethod: string;

  @Column({
    type: 'enum',
    enum: MiddlewareType,
    default: MiddlewareType.request,
  })
  type: MiddlewareType;

  @Column({ type: 'json', default: {} })
  params: IRemoteMiddlewareReqParams;
}

export default Middleware;
