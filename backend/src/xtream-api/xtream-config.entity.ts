import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('xtream_configs')
export class XtreamConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, default: 'default' })
  name: string;

  @Column()
  serverUrl: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  authData: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
