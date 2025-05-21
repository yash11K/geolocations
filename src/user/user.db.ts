import {User} from "./user.service";

interface UserWithCredentials extends User {
  username: string;
  password: string;
}

export const USERS: UserWithCredentials[] = [
    { userId: 'customer1', userType: 'customer', username: 'john.doe', password: 'pass123' },
    { userId: 'customer2', userType: 'customer', username: 'jane.smith', password: 'pass456' },
    { userId: 'customer3', userType: 'customer', username: 'alice.wong', password: 'pass789' },
    { userId: 'driver1', userType: 'driver', username: 'mike.johnson', password: 'driver123' },
    { userId: 'driver2', userType: 'driver', username: 'sarah.parker', password: 'driver456' },
    { userId: 'customer4', userType: 'customer', username: 'robert.brown', password: 'pass101' },
    { userId: 'customer5', userType: 'customer', username: 'emma.wilson', password: 'pass202' },
    { userId: 'driver3', userType: 'driver', username: 'david.miller', password: 'driver789' },
];
