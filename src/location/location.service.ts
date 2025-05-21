import { Injectable } from '@nestjs/common';
import { LocationDto, LocationResponse, SocketWithUser } from './location.dto';
import { UserConnectionManager } from './services/user-connection.manager';
import { getReservationByCustomerId, getReservationByDriverId } from '../reservations/reservations.config';

@Injectable()
export class LocationService {
  private lastKnownLocations: Map<string, LocationDto> = new Map();

  constructor(private readonly userConnectionManager: UserConnectionManager) {}

  async handleLocationUpdate(
    client: SocketWithUser,
    rawData: any,
    callback?: (response: LocationResponse) => void
  ): Promise<LocationResponse> {
    try {
      if (!client.userId || !client.userType || !client.reservationId) {
        throw new Error('User not properly registered');
      }

      const data = this.parsePayload(rawData);
      const latitude = data?.latitude || data?.data?.latitude;
      const longitude = data?.longitude || data?.data?.longitude;

      if (latitude === undefined || longitude === undefined) {
        throw new Error('Invalid location data. Required: latitude and longitude');
      }

      const payload: LocationDto = {
        userId: client.userId,
        userType: client.userType,
        latitude: Number(latitude),
        longitude: Number(longitude),
        reservationId: client.reservationId
      };

      // Store the last known location
      this.lastKnownLocations.set(client.userId, payload);

      const reservation = client.userType === 'customer'
        ? getReservationByCustomerId(client.userId)
        : getReservationByDriverId(client.userId);

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      const pairedUserIds = client.userType === 'customer'
        ? [reservation.driverId]
        : [reservation.customerId];

      let successCount = 0;
      for (const pairedUserId of pairedUserIds) {
        const pairedUser = this.userConnectionManager.getConnectedUser(pairedUserId);
        if (pairedUser) {
          pairedUser.socket.emit('location', payload, (ack: any) => {
            if (ack?.status === 'received') {
              successCount++;
            }
          });
        }
      }

      const response: LocationResponse = {
        status: 'success',
        message: `Location shared with ${successCount} recipient(s)`,
        reservationId: client.reservationId
      };

      if (callback) {
        callback(response);
      }

      return response;
    } catch (error) {
      const errorResponse: LocationResponse = {
        status: 'error',
        message: error.message
      };

      if (callback) {
        callback(errorResponse);
      }

      return errorResponse;
    }
  }

  private parsePayload(data: any): any {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.log('Failed to parse string payload:', e);
        return null;
      }
    }
    return data;
  }

  async handlePing(
    client: SocketWithUser,
    callback?: (response: LocationResponse) => void
  ): Promise<LocationResponse> {
    try {
      if (!client.userId || !client.userType || !client.reservationId) {
        throw new Error('User not properly registered');
      }

      const reservation = client.userType === 'customer'
        ? getReservationByCustomerId(client.userId)
        : getReservationByDriverId(client.userId);

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      const pairedUserId = client.userType === 'customer'
        ? reservation.driverId
        : reservation.customerId;

      const pairedUser = this.userConnectionManager.getConnectedUser(pairedUserId);
      
      if (pairedUser) {
        // Simply emit PING event to the paired user
        pairedUser.socket.emit('ping', {
          fromUserId: client.userId,
          fromUserType: client.userType,
          reservationId: client.reservationId
        });
      }

      const response: LocationResponse = {
        status: 'success',
        message: 'PING sent successfully',
        reservationId: client.reservationId
      };

      if (callback) {
        callback(response);
      }

      return response;
    } catch (error) {
      const errorResponse: LocationResponse = {
        status: 'error',
        message: error.message
      };

      if (callback) {
        callback(errorResponse);
      }

      return errorResponse;
    }
  }
}
