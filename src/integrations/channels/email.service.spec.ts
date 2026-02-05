import { Test, TestingModule } from '@nestjs/testing';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MailerModule.forRoot({
          transport: {
            host: 'smtp.example.com',
            port: 587,
            secure: false,
            auth: {
              user: 'test@example.com',
              pass: 'password',
            },
          },
          defaults: {
            from: '"Test" <test@example.com>',
          },
        }),
      ],
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});