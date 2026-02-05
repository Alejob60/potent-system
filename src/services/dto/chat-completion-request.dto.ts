import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({ 
    description: 'The role of the message sender',
    enum: ['system', 'user', 'assistant']
  })
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({ 
    description: 'The content of the message'
  })
  content: string;
}

export class ChatCompletionRequestDto {
  @ApiProperty({ 
    description: 'Array of messages in the conversation',
    type: [MessageDto]
  })
  messages: MessageDto[];

  @ApiProperty({ 
    description: 'Controls randomness in the response (0.0 to 1.0)',
    minimum: 0,
    maximum: 1,
    required: false
  })
  temperature?: number;

  @ApiProperty({ 
    description: 'Maximum number of tokens to generate',
    minimum: 1,
    required: false
  })
  max_tokens?: number;

  @ApiProperty({ 
    description: 'Controls diversity via nucleus sampling (0.0 to 1.0)',
    minimum: 0,
    maximum: 1,
    required: false
  })
  top_p?: number;

  @ApiProperty({ 
    description: 'Reduces repetition based on frequency of tokens',
    minimum: -2,
    maximum: 2,
    required: false
  })
  frequency_penalty?: number;

  @ApiProperty({ 
    description: 'Reduces repetition based on presence of tokens',
    minimum: -2,
    maximum: 2,
    required: false
  })
  presence_penalty?: number;
}