import { RemoteConfig } from '@lomray/microservice-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { bucketNameMock } from '@__mocks__/common';
import File from '@entities/file';
import FileEntity from '@entities/file-entity';
import FilePostProcess from '@services/file-post-process';

describe('services/file-domain', () => {
  const sandbox = sinon.createSandbox();
  const fileUrl = '/test/file/url';
  const formatSmallUrl = '/small/url';
  const formatMediumUrl = '/medium/url';
  const formatLargeUrl = '/large/url';
  const s3Mock = {
    bucketName: bucketNameMock,
  };

  /**
   * Create file
   */
  const getFile = (url = fileUrl) =>
    Object.assign(new File(), {
      id: 'id',
      url,
      formats: {
        small: {
          url: formatSmallUrl,
        },
        medium: {
          url: formatMediumUrl,
        },
        large: {
          url: formatLargeUrl,
        },
      },
    });
  const getFileEntity = () =>
    Object.assign(new FileEntity(), {
      file: getFile(),
    });

  /**
   * Helpers for add s3 domain to url
   */
  const withS3Domain = (url: string): string => `https://${bucketNameMock}.s3.amazonaws.com${url}`;

  /**
   * Expectation
   */
  const expectWithUrl = ({ url, formats: { small, medium, large } }: File): void => {
    expect(url).to.equal(withS3Domain(fileUrl));
    expect(small.url).to.equal(withS3Domain(formatSmallUrl));
    expect(medium.url).to.equal(withS3Domain(formatMediumUrl));
    expect(large.url).to.equal(withS3Domain(formatLargeUrl));
  };

  beforeEach(() => {
    sandbox.stub(RemoteConfig, 'get').resolves({ s3: s3Mock });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should add domain to url and formats file', async () => {
    const file = await FilePostProcess.handle(getFile());

    expectWithUrl(file);
  });

  it('should add domain to file entity', async () => {
    const { file } = await FilePostProcess.handleRelation(getFileEntity());

    expectWithUrl(file);
  });

  it('should skip url and return only provided formats', async () => {
    const {
      url,
      formats: { small, medium, large },
    } = await FilePostProcess.handle(getFile(''), {
      onlyFormats: ['medium'],
    });

    expect(url).to.equal('');
    expect(small?.url).to.undefined;
    expect(medium.url).to.equal(withS3Domain(formatMediumUrl));
    expect(large?.url).to.undefined;
  });

  it('should add domain to array files', async () => {
    const result = await FilePostProcess.handleMultiple([getFile(), getFile()]);

    for (const file of result) {
      expectWithUrl(file);
    }
  });

  it('should add domain to array file entities', async () => {
    const result = await FilePostProcess.handleMultipleRelations([
      getFileEntity(),
      getFileEntity(),
    ]);

    for (const { file } of result) {
      expectWithUrl(file);
    }
  });
});
