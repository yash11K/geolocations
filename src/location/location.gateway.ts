import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { LocationService } from './location.service';
import { UserConnectionManager } from './services/user-connection.manager';
import { LocationResponse, SocketWithUser } from './location.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  allowEIO3: true,
  transports: ['websocket'],
})
export class LocationGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userConnectionManager: UserConnectionManager,
    private readonly locationService: LocationService
  ) {}

  afterInit(server: Server) {
    console.log('🚀 WebSocket Gateway Initialized');
  }

  async handleConnection(client: SocketWithUser) {
    try {
      const status = await this.userConnectionManager.handleConnection(client);
      
      if (status.status === 'error') {
        client.disconnect(true);
        return;
      }

      console.log(`🔌 Client connected: ${client.id} (${status.userId} as ${status.userType})`);
      console.log(`📋 Active reservation: ${status.reservationId}`);
      console.log(`👥 Total connected users: ${this.userConnectionManager.getConnectedUsersCount()}`);

      client.emit('connection_status', status);
    } catch (error) {
      console.error('❌ Connection error:', error.message);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: SocketWithUser) {
    const userId = client.userId;
    if (userId) {
      console.log(`❌ Client disconnected: ${client.id} (${userId} as ${client.userType})`);
      this.userConnectionManager.handleDisconnect(client);
      console.log(`👥 Total connected users: ${this.userConnectionManager.getConnectedUsersCount()}`);
    }
  }

  @SubscribeMessage('location')
  async handleLocation(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() rawData: any,
    callback: (response: LocationResponse) => void
  ) {
    try {
      const response = await this.locationService.handleLocationUpdate(client, rawData, callback);
      console.log(`📍 Location update from ${client.userId} (${client.userType}):`, response);
      return response;
    } catch (error) {
      console.error('❌ Location error:', error.message);
      const errorResponse: LocationResponse = {
        status: 'error' as const,
        message: error.message
      };
      if (callback) {
        callback(errorResponse);
      }
      return errorResponse;
    }
  }
}
