import { BaseException } from '@lomray/microservice-nodejs-lib';
import { EntityManager, EntityRepository, Repository } from 'typeorm';
import CustomerEntity from '@entities/customer';
import messages from '@helpers/validators/messages';

@EntityRepository(CustomerEntity)
class Customer extends Repository<CustomerEntity> {
  /**
   * Returns customer by account id
   */
  public static async getCustomerByAccountId(
    accountId: string,
    manager: EntityManager,
  ): Promise<CustomerEntity> {
    const customer = await manager
      .getRepository(CustomerEntity)
      .createQueryBuilder('customer')
      .where("customer.params ->> 'accountId' = :accountId", { accountId })
      .getOne();

    if (!customer) {
      throw new BaseException({
        status: 500,
        message: messages.getNotFoundMessage('Customer'),
      });
    }

    return customer;
  }
}

export default Customer;
