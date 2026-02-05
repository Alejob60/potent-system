import { ApiProperty } from '@nestjs/swagger';

class ChoiceDto {
  @ApiProperty()
  index: number;

  @ApiProperty({
    type: 'object',
    properties: {
      role: { type: 'string' },
      content: { type: 'string' }
    }
  })
  message: {
    role: string;
    content: string;
  };

  @ApiProperty()
  finish_reason: string;
}

class UsageDto {
  @ApiProperty()
  prompt_tokens: number;

  @ApiProperty()
  completion_tokens: number;

  @ApiProperty()
  total_tokens: number;
}

export class ChatCompletionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  object: string;

  @ApiProperty()
  created: number;

  @ApiProperty()
  model: string;

  @ApiProperty({ type: [ChoiceDto] })
  choices: ChoiceDto[];

  @ApiProperty({ type: UsageDto })
  usage: UsageDto;
}