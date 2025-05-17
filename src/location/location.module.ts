import { Module } from '@nestjs/common';
import { LocationGateway } from './location.gateway';
import {UserService} from "../user/user.service";
import { LocationService } from './location.service';
import { UserConnectionManager } from './services/user-connection.manager';

@Module({
  providers: [
    LocationGateway,
    UserService,
    LocationService,
    UserConnectionManager
  ],
})
export class LocationModule {}
