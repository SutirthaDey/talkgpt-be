import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn({
    type: 'int',
    generated: true,
    nullable: false,
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  password?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  googleId?: string;
}
