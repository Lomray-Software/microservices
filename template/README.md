# NodeJS Microservices based on [microservice-nodejs-lib](https://github.com/Lomray-Software/microservice-nodejs-lib)

## Microservices list:
 - [Authentication](https://github.com/Lomray-Software/microservices/tree/staging/microservices/authentication)
 - [Authorization](https://github.com/Lomray-Software/microservices/tree/staging/microservices/authorization)
 - [Configuration](https://github.com/Lomray-Software/microservices/tree/staging/microservices/configuration)
 - [Cron](https://github.com/Lomray-Software/microservices/tree/staging/microservices/cron)
 - [Files](https://github.com/Lomray-Software/microservices/tree/staging/microservices/files)
 - [Gateway](https://github.com/Lomray-Software/microservices/tree/staging/microservices/gateway)
 - [Notification](https://github.com/Lomray-Software/microservices/tree/staging/microservices/notification)
 - [Users](https://github.com/Lomray-Software/microservices/tree/staging/microservices/users)
 
Use `microservices create your-ms-name` for create new microservice from template.

See [detailed instruction](https://github.com/Lomray-Software/microservices)

## Extend microservice (`package` type) example:
```shell
microservices extend users --staging
```

let's extend the `user` and `profile` entity, create `entities/user.ts`:
```typescript
import DefaultUser from '@lomray/microservice-users/entities/user';
import { Entity, OneToOne, Column } from 'typeorm';
import { Length } from 'class-validator';
import Profile from '@entities/profile';

@Entity()
class User extends DefaultUser {
  /**
   * Our custom field
   */
  @Column({ type: 'varchar', length: 255, default: null })
  @Length(1, 255)
  customField: string;

  /**
   * Also, customize Profile
   */
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}

export default User;
```

create `profile.ts`:
```typescript
import { IsNullable, IsUndefinable } from '@lomray/microservice-helpers';
import DefaultProfile from '@lomray/microservice-users/entities/profile';
import { Length } from 'class-validator';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import type User from '@entities/user';

@Entity()
class Profile extends DefaultProfile {
  @Column({ type: 'varchar', length: 255, default: null })
  @Length(1, 255)
  @IsNullable()
  @IsUndefinable()
  customField: null | string;

  @OneToOne('User', 'profile')
  @JoinColumn()
  user: User;
}

export default Profile;
```

and finally create migration with created fields `migrations/1650447115917-init.ts`:
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export default class init1650447115917 implements MigrationInterface {
  name = 'init1650447115917';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "profile" ADD "customField" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "user" ADD "customField" character varying(255)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "customField"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "customField"`);
  }
}
```

That's it, happy coding.
