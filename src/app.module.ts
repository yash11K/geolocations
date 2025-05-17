import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { LocationModule } from './location/location.module';
import {LocationGateway} from "./location/location.gateway";
import {UserService} from "./user/user.service";

@Module({
  imports: [UserModule, LocationModule],
})
export class AppModule {} 