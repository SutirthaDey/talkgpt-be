import { User } from 'src/users/user.entity';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryColumn({
    type: 'int',
    generated: true,
    nullable: false,
  })
  id: number;

  @Column({
    type: 'varchar',
    nullable: true,
    length: '100',
  })
  firstName?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: '100',
  })
  lastName?: string;

  @Column({
    nullable: true,
  })
  profilePic?: string;

  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
