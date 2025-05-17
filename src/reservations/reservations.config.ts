export interface ReservationMapping {
  reservationId: string;
  customerId: string;
  driverId: string;
  status: 'active' | 'completed' | 'cancelled';
}

//DATABASE MOCK
export const RESERVATION_MAPPINGS: ReservationMapping[] = [
  {
    reservationId: 'RES001',
    customerId: 'customer1',
    driverId: 'driver1',
    status: 'active'
  },
  {
    reservationId: 'RES002',
    customerId: 'customer2',
    driverId: 'driver2',
    status: 'active'
  },
  {
    reservationId: 'RES003',
    customerId: 'customer3',
    driverId: 'driver3',
    status: 'active'
  }
];

// Helper functions to work with reservations
export const getReservationByCustomerId = (customerId: string): ReservationMapping | undefined => {
  return RESERVATION_MAPPINGS.find(
    mapping => mapping.customerId === customerId && mapping.status === 'active'
  );
};

export const getReservationByDriverId = (driverId: string): ReservationMapping | undefined => {
  return RESERVATION_MAPPINGS.find(
    mapping => mapping.driverId === driverId && mapping.status === 'active'
  );
};

export const getReservationById = (reservationId: string): ReservationMapping | undefined => {
  return RESERVATION_MAPPINGS.find(mapping => mapping.reservationId === reservationId);
}; 