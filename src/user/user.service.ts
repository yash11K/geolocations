import { Injectable } from '@nestjs/common';
import {USERS} from "./user.db";

// This would typically be the database model
export interface User {
    userId: string;
    userType: 'customer' | 'driver';
}


@Injectable()
export class UserService {
    async validateUser(userId: string): Promise<User | null> {
        // In production, this would query a database
        const user : User = USERS.find((u: { userId: string; }) => u.userId === userId);
        return user || null;
    }

    async getUserType(userId: string): Promise<'customer' | 'driver' | null> {
        const user = await this.validateUser(userId);
        return user?.userType || null;
    }
}
