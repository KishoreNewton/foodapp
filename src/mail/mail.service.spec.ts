import { Test } from '@nestjs/testing';
import { MailService } from './mail.service';
import { CONFIG_OPTIONS } from 'src/common/common.constant';


describe('Mail Service', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            source: 'TEST_SOURCE'
          }
        }
      ]
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('Should Be Defined', () => {
    expect(service).toBeDefined();
  });
});


// Fix aws then test