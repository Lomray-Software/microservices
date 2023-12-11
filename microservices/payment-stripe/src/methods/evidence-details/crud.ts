import { Endpoint } from '@lomray/microservice-helpers';
import { getRepository } from 'typeorm';
import EvidenceDetails from '@entities/evidence-details';

/**
 * CRUD controller for Evidence Details entity
 */
const crud = Endpoint.controller(() => getRepository(EvidenceDetails), {
  restore: false,
});

export default crud;
