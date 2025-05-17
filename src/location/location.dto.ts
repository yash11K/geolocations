import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { Socket } from 'socket.io';

// Base DTOs
export class LocationDto {
    @IsString()
    userId: string;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsEnum(['customer', 'driver'])
    userType: 'customer' | 'driver';

    @IsString()
    @IsOptional()
    reservationId?: string;
}

// Socket Extension
export interface SocketWithUser extends Socket {
    userId?: string;
    userType?: 'customer' | 'driver';
    reservationId?: string;
}

// Response DTOs
export interface ConnectionStatus {
    status: 'connected' | 'error';
    message: string;
    userId?: string;
    userType?: 'customer' | 'driver';
    reservationId?: string;
}

export interface LocationResponse {
    status: 'success' | 'error';
    message: string;
    reservationId?: string;
}

// Type Guards
export function isLocationDto(obj: any): obj is LocationDto {
    return obj 
        && typeof obj.userId === 'string'
        && typeof obj.latitude === 'number'
        && typeof obj.longitude === 'number'
        && ['customer', 'driver'].includes(obj.userType)
        && (!obj.reservationId || typeof obj.reservationId === 'string');
}

export function isConnectionStatus(obj: any): obj is ConnectionStatus {
    return obj
        && ['connected', 'error'].includes(obj.status)
        && typeof obj.message === 'string'
        && (!obj.userId || typeof obj.userId === 'string')
        && (!obj.userType || ['customer', 'driver'].includes(obj.userType))
        && (!obj.reservationId || typeof obj.reservationId === 'string');
}

export function isLocationResponse(obj: any): obj is LocationResponse {
    return obj
        && ['success', 'error'].includes(obj.status)
        && typeof obj.message === 'string'
        && (!obj.reservationId || typeof obj.reservationId === 'string');
}
