import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    /**
     * TypeOrmModule.forFeature([User]) → daftarkan entity User
     * ke modul ini supaya bisa di-inject ke UserService
     */
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserService],
  controllers: [UserController],
  /**
   * exports: [UserService] → izinkan modul lain (AuthModule)
   * untuk menggunakan UserService
   */
  exports: [UserService],
})
export class UserModule {}
