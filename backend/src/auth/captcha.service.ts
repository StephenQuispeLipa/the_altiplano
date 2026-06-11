import {

  Injectable,

  BadRequestException,

  UnauthorizedException,

} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository, LessThan } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { v4 as uuidv4 } from 'uuid';

import { CaptchaChallenge } from './entities/captcha-challenge.entity';



export interface CaptchaResponse {

  captchaId: string;

  text: string;

}



const CAPTCHA_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';



@Injectable()

export class CaptchaService {

  constructor(

    @InjectRepository(CaptchaChallenge)

    private readonly captchaRepo: Repository<CaptchaChallenge>,

  ) {}



  private generateCaptchaText(length = 5): string {

    let result = '';

    for (let i = 0; i < length; i += 1) {

      result += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];

    }

    return result;

  }



  async generate(): Promise<CaptchaResponse> {

    await this.captchaRepo.delete({ expiresAt: LessThan(new Date()) });



    const text = this.generateCaptchaText();

    const id = uuidv4();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);



    await this.captchaRepo.save({

      id,

      answerHash: await bcrypt.hash(text.toLowerCase(), 8),

      expiresAt,

    });



    return {

      captchaId: id,

      text,

    };

  }



  async validate(captchaId: string, captchaAnswer: string): Promise<void> {

    if (!captchaId || captchaAnswer === undefined || captchaAnswer === '') {

      throw new BadRequestException('CAPTCHA requerido.');

    }



    const challenge = await this.captchaRepo.findOne({ where: { id: captchaId } });

    if (!challenge) {

      throw new UnauthorizedException('CAPTCHA inválido o expirado.');

    }



    if (challenge.expiresAt < new Date()) {

      await this.captchaRepo.delete({ id: captchaId });

      throw new UnauthorizedException('CAPTCHA expirado. Intenta de nuevo.');

    }



    const normalized = String(captchaAnswer).trim().toLowerCase();

    const valid = await bcrypt.compare(normalized, challenge.answerHash);

    await this.captchaRepo.delete({ id: captchaId });



    if (!valid) {

      throw new UnauthorizedException('Texto CAPTCHA incorrecto.');

    }

  }

}


