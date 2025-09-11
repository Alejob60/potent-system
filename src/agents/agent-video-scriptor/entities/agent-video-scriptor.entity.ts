import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('agent_video_scripts')
export class AgentVideoScriptor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  topic: string;

  @Column('text')
  script: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}