import { RemoteConfig } from '@lomray/microservice-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { bucketNameMock } from '@__mocks__/common';
import Attachment from '@entities/attachment';
import AttachmentEntity from '@entities/attachment-entity';
import AttachmentDomain from '@services/attachment-domain';

describe('services/attachment-domain', () => {
  const sandbox = sinon.createSandbox();
  const attachmentUrl = '/test/attachment/url';
  const formatSmallUrl = '/small/url';
  const formatMediumUrl = '/medium/url';
  const formatLargeUrl = '/large/url';
  const s3Mock = {
    bucketName: bucketNameMock,
  };

  /**
   * Create attachment
   */
  const getAttachment = (url = attachmentUrl) =>
    Object.assign(new Attachment(), {
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
  const getAttachmentEntity = () =>
    Object.assign(new AttachmentEntity(), {
      attachment: getAttachment(),
    });

  /**
   * Helpers for add s3 domain to url
   */
  const withS3Domain = (url: string): string => `https://${bucketNameMock}.s3.amazonaws.com${url}`;

  /**
   * Expectation
   */
  const expectWithUrl = ({ url, formats: { small, medium, large } }: Attachment): void => {
    expect(url).to.equal(withS3Domain(attachmentUrl));
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

  it('should add domain to url and formats attachment', async () => {
    const attachment = await AttachmentDomain.addDomain(getAttachment());

    expectWithUrl(attachment);
  });

  it('should add domain to attachment entity', async () => {
    const { attachment } = await AttachmentDomain.addDomainRelation(getAttachmentEntity());

    expectWithUrl(attachment);
  });

  it('should skip url and return only provided formats', async () => {
    const {
      url,
      formats: { small, medium, large },
    } = await AttachmentDomain.addDomain(getAttachment(''), {
      onlyFormats: ['medium'],
    });

    expect(url).to.equal('');
    expect(small?.url).to.undefined;
    expect(medium.url).to.equal(withS3Domain(formatMediumUrl));
    expect(large?.url).to.undefined;
  });

  it('should add domain to array attachments', async () => {
    const result = await AttachmentDomain.addDomains([getAttachment(), getAttachment()]);

    for (const attachment of result) {
      expectWithUrl(attachment);
    }
  });

  it('should add domain to array attachment entities', async () => {
    const result = await AttachmentDomain.addDomainsRelation([
      getAttachmentEntity(),
      getAttachmentEntity(),
    ]);

    for (const { attachment } of result) {
      expectWithUrl(attachment);
    }
  });
});
