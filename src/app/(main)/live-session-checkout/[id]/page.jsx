import LiveSessionCheckout from '@/components/CheckOut/LiveSessionCheckout';
import { Suspense } from 'react';

const Page = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading checkout...</p>
                </div>
            </div>
        }>
            <LiveSessionCheckout />
        </Suspense>
    );
};

export default Page;