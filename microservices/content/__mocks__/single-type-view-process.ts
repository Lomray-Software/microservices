const adminsRelationMock = ['blog.admins'];

const adminsSingleTypeMock = {
  alias: 'blog',
  value: {
    blog: {
      id: 'a4d8d9ef-a45b-4ea2-ad79-4598959fe0a7',
      data: {
        admins: ['b4d8d9ef-a45b-4ea2-ad79-4598959fe0a7', 'c4d8d9ef-a45b-4ea2-ad79-4598959fe0a7'],
      },
    },
  },
};

const adminsMock = [
  {
    id: 'b4d8d9ef-a45b-4ea2-ad79-4598959fe0a7',
    username: null,
    firstName: 'Oleg',
    lastName: 'Do',
    middleName: '',
    email: 'oleg.do@bloom.com',
    phone: null,
    createdAt: '2023-02-08T14:01:34.429Z',
    updatedAt: '2023-02-08T14:01:34.429Z',
    deletedAt: null,
    averageRating: 0,
    followersCount: 0,
    followingCount: 0,
  },
  {
    id: 'c4d8d9ef-a45b-4ea2-ad79-4598959fe0a7',
    username: null,
    firstName: 'Alex',
    lastName: 'Sinon',
    middleName: '',
    email: 'alex.sinon@hotmail.com',
    phone: null,
    createdAt: '2023-02-08T14:01:44.978Z',
    updatedAt: '2023-02-08T14:01:44.978Z',
    deletedAt: null,
    averageRating: 0,
    followersCount: 0,
    followingCount: 0,
  },
];

const errMsgFailedToGetComponentData =
  "Failed to get component data because it doesn't exist according to the passed relationship routes";

export { adminsSingleTypeMock, adminsMock, adminsRelationMock, errMsgFailedToGetComponentData };
