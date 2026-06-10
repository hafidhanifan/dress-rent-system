import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';
import { CategoryModule } from './category/category.module';
import { Category } from './category/category.entity';
import { DressModule } from './dress/dress.module';
import { Dress } from './dress/dress.entity';
import { DressPhoto } from './dress/dress-photo.entity';
import { DressSize } from './dress/dress-size.entity';
import { WishlistModule } from './wishlist/wishlist.module';
import { Wishlist } from './wishlist/wishlist.entity';
import { OrderModule } from './order/order.module';
import { Order } from './order/order.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // ConfigModule.forRoot() → baca file .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Serve foto secara statis dari folder public/
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    // Koneksi ke PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities: [
          User,
          Category,
          Dress,
          DressPhoto,
          DressSize,
          Wishlist,
          Order,
        ], // daftarkan semua entity di sini
        synchronize: true, // ⚠️ hanya untuk development! matikan di production
      }),
    }),

    UserModule,
    AuthModule,
    CategoryModule,
    DressModule,
    WishlistModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
