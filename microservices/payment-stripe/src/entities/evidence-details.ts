import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsNumber, IsObject, Length, Min } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, PrimaryColumn, JoinColumn, OneToOne } from 'typeorm';
import type Dispute from '@entities/dispute';

@JSONSchema({
  title: 'Evidence details',
  description: 'Dispute evidence details',
  properties: {
    dispute: { $ref: '#/definitions/Dispute' },
  },
})
@Entity()
class EvidenceDetails {
  @JSONSchema({
    description: 'Microservice dispute id',
  })
  @PrimaryColumn('uuid')
  @Length(1, 36)
  disputeId: string;

  @JSONSchema({
    description: 'Whether evidence has been submitted',
  })
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  hasEvidence: boolean;

  @JSONSchema({
    description:
      'The number of times evidence has been submitted. Typically, evidence can be submitted only once.',
  })
  @Column({ type: 'int', default: 0 })
  @Min(0)
  @IsNumber()
  @IsUndefinable()
  submissionCount: number;

  @JSONSchema({
    description:
      'Date by which evidence must be submitted in order to successfully challenge dispute. Will be 0 if the customer’s bank or credit card company doesn’t allow a response for this particular dispute',
  })
  @Column({ type: 'timestamp', default: null })
  @IsTypeormDate()
  @IsUndefinable()
  dueBy: Date | null;

  @JSONSchema({
    description:
      'Whether the last evidence submission was submitted past the due date. Defaults to false if no evidence submissions have occurred. If true, then delivery of the latest evidence is not guaranteed.',
  })
  @Column({ type: 'boolean' })
  @IsBoolean()
  @IsUndefinable()
  isPastBy: boolean;

  @OneToOne('Dispute', 'evidenceDetails')
  @IsObject()
  @IsUndefinable()
  @JoinColumn({ name: 'disputeId', referencedColumnName: 'id' })
  dispute: Dispute;
}

export default EvidenceDetails;
