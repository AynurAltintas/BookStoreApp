import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  author!: string;

  @Column({ default: 0 })
  price!: number;

  @Column({ default: 0 })
  salesCount!: number;

  @Column({ default: 10 })
  stock!: number; 

  @Column({ default: '' })
  coverUrl!: string;
}