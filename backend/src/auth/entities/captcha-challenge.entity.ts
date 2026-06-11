import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('captcha_challenges')
export class CaptchaChallenge {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ name: 'answer_hash', length: 255 })
  answerHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}
