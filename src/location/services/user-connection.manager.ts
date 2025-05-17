import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserService } from '../../user/user.service';
import { getReservationByCustomerId, getReservationByDriverId } from '../../reservations/reservations.config';

export interface SocketWithUser extends Socket {
  userId?: string;
  userType?: 'customer' | 'driver';
  reservationId?: string;
}

export interface ConnectionStatus {
  status: 'connected' | 'error';
  message: string;
  userId?: string;
  userType?: 'customer' | 'driver';
  reservationId?: string;
}

@Injectable()
export class UserConnectionManager {
  private connectedUsers: Map<string, { socket: SocketWithUser; userType: string }> = new Map();
  private socketToUser: Map<string, string> = new Map();

  constructor(private readonly userService: UserService) {}

  async handleConnection(client: SocketWithUser): Promise<ConnectionStatus> {
    try {
      const userId = client.handshake.query.userId as string;
      if (!userId) {
        throw new Error('No userId provided');
      }

      const userType = await this.userService.getUserType(userId);
      if (!userType) {
        throw new Error('Invalid user type');
      }

      const reservation = userType === 'customer'
        ? getReservationByCustomerId(userId)
        : getReservationByDriverId(userId);

      if (!reservation) {
        throw new Error('No active reservation found');
      }

      // Store user information in socket
      client.userId = userId;
      client.userType = userType;
      client.reservationId = reservation.reservationId;

      // Store in our maps
      this.connectedUsers.set(userId, { socket: client, userType });
      this.socketToUser.set(client.id, userId);

      return {
        status: 'connected',
        message: 'Successfully connected to server!',
        userId,
        userType,
        reservationId: reservation.reservationId
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  handleDisconnect(client: SocketWithUser): void {
    const userId = client.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.socketToUser.delete(client.id);
    }
  }

  getConnectedUser(userId: string): { socket: SocketWithUser; userType: string } | undefined {
    return this.connectedUsers.get(userId);
  }

  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }
} 