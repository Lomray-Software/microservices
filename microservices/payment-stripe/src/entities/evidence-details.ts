import { IsTypeormDate, IsUndefinable } from '@lomray/microservice-helpers';
import { IsBoolean, IsNumber, IsObject, Length, Min } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { Column, Entity, PrimaryColumn, JoinColumn, OneToOne } from 'typeorm';
import Dispute from '@entities/dispute';

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

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  hasEvidence: boolean;

  @Column({ type: 'int', default: 0 })
  @Min(0)
  @IsNumber()
  @IsUndefinable()
  submissionCount: number;

  @Column({ type: 'timestamp' })
  @IsTypeormDate()
  @IsUndefinable()
  dueBy: Date;

  @Column({ type: 'timestamp' })
  @IsTypeormDate()
  @IsUndefinable()
  pastBy: Date;

  @OneToOne('Dispute', 'evidenceDetails')
  @IsObject()
  @IsUndefinable()
  @JoinColumn({ name: 'disputeId', referencedColumnName: 'id' })
  dispute: Dispute;
}

export default EvidenceDetails;
