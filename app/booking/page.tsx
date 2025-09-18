import BookingPage from '@/components/BookingPage';
import React from 'react';

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = () => {
  return (
    <div>
      <BookingPage/>
    </div>
  );
}

export default Page;
