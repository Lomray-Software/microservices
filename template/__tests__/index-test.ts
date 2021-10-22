// import { Microservice } from '@lomray/microservice-nodejs-lib';
// import { expect } from 'chai';
// import sinon from 'sinon';
// import { MS_NAME, MS_CONNECTION } from '@constants/environment';
//
// describe('gateway', () => {
//   const microservice = Microservice.create();
//
//   const spyCreate = sinon.spy(Microservice, 'create');
//   const stubbedStart = sinon.stub(microservice, 'start').resolves();
//
//   after(() => {
//     sinon.restore();
//   });
//
//   it('should correct start microservice', async () => {
//     await import('../src/index');
//
//     const createOptions = spyCreate.firstCall.firstArg;
//
//     expect(createOptions).to.includes({ name: MS_NAME, connection: MS_CONNECTION });
//     expect(stubbedStart).to.calledOnce;
//   });
// });
