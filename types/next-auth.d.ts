import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: string
      userLocations: {
        id: string;
        userId: string;
        locationId: string;
        createdAt: Date;
      }[];
    }
  }

  interface User {
    role: string
    userLocations: {
      id: string;
      userId: string;
      locationId: string;
      createdAt: Date;
    }[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}