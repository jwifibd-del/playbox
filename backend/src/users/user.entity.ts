import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true, length: 4 })
  pin?: string;

  @Column({ default: false })
  pinEnabled: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordTokenExpires?: Date;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  otpExpires?: Date;

  @Column({ nullable: true })
  otp?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
