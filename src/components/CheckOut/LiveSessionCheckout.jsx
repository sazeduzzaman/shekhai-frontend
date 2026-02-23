"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, Shield, Smartphone, Loader2, ExternalLink, AlertCircle, CreditCard, Calendar, Clock, Users, Video } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";

// bKash Configuration
const BKASH_CONFIG = {
    IS_SANDBOX: true,
    CALLBACK_URL: typeof window !== 'undefined' ? `${window.location.origin}/api/bkash/callback` : "",
};

// Test credentials for bKash sandbox
const BKASH_TEST_CREDENTIALS = {
    PHONE: "01929918378",
    OTP: "123456",
    MPIN: "12121"
};

// Dummy user ID for testing (you'll replace with actual logged-in user ID)
const TEST_USER_ID = "67b9d5c87b6d0a1a2b3c4d5e";

const LiveSessionCheckout = () => {
    const params = useParams();
    const router = useRouter();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState(1);
    const [paymentId, setPaymentId] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [idToken, setIdToken] = useState("");
    const [showTestInfo, setShowTestInfo] = useState(true);
    const [enrollmentResult, setEnrollmentResult] = useState(null);

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        phone: "",
    });

    const sessionId = params.id;

    // Initialize with test data
    useEffect(() => {
        setFormData({
            fullname: "Unique User",
            email: "unique@user.com",
            phone: "01929918378",
        });
    }, []);

    // Fetch session data
    useEffect(() => {
        const fetchSession = async () => {
            if (!sessionId) {
                toast.error("No session selected");
                router.push("/live-sessions");
                return;
            }

            try {
                setLoading(true);
                // Fetch from your actual API
                const response = await axios.get(
                    `http://localhost:8080/api/v1/live-sessions/${sessionId}`
                );

                if (response.data.success) {
                    const sessionData = response.data.data;
                    setSession({
                        id: sessionData._id || sessionData.id,
                        title: sessionData.title || "Unknown Live Session",
                        description: sessionData.description || sessionData.shortDescription || "No description available",
                        price: sessionData.discountedPrice || sessionData.price || 0,
                        bannerUrl: sessionData.bannerUrl || sessionData.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                        instructor: sessionData.instructor?.name || "Expert Instructor",
                        instructorId: sessionData.instructor?._id || "default-instructor-id",
                        schedule: sessionData.schedule || {},
                        duration: sessionData.duration || "2 hours",
                        totalSlots: sessionData.totalSlots || 50,
                        availableSlots: sessionData.availableSlots || 50,
                        isPaid: sessionData.isPaid || false,
                        category: sessionData.category || "Workshop",
                        subCategory: sessionData.subCategory || "Development"
                    });
                } else {
                    throw new Error("Failed to fetch session");
                }

            } catch (error) {
                console.error("Error fetching session:", error);
                // Fallback to demo data
                setSession({
                    id: sessionId,
                    title: "Live React Workshop",
                    description: "Join our live interactive React workshop with hands-on coding",
                    price: 1500,
                    bannerUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                    instructor: "John Doe",
                    instructorId: "instructor123",
                    schedule: {
                        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        timezone: "Asia/Dhaka"
                    },
                    duration: "3 hours",
                    totalSlots: 50,
                    availableSlots: 35,
                    isPaid: true,
                    category: "Development",
                    subCategory: "React"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [sessionId, router]);

    // Get bKash Access Token via Proxy
    const getBkashAccessToken = async () => {
        try {
            const response = await axios.post('/api/bkash', {
                action: 'getToken'
            });

            if (response.data && response.data.id_token) {
                setIdToken(response.data.id_token);
                return response.data.id_token;
            } else {
                throw new Error(response.data?.error || "No token received");
            }
        } catch (error) {
            console.error("bKash token error:", error);
            toast.error(`Token Error: ${error.response?.data?.error || error.message}`);
            throw error;
        }
    };

    // Create bKash Payment via Proxy
    const createBkashPayment = async () => {
        try {
            setProcessing(true);

            // Validate personal info
            if (!validateStep1()) {
                setProcessing(false);
                return;
            }

            // Check seat availability
            if (session?.availableSlots <= 0) {
                toast.error("Sorry, this session is fully booked!");
                setProcessing(false);
                return;
            }

            // Get access token
            const token = await getBkashAccessToken();

            // Create payment
            const invoiceNumber = `LIVE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const amount = session?.price || 1500;

            const paymentRequest = {
                mode: "0011",
                payerReference: formData.phone,
                callbackURL: BKASH_CONFIG.CALLBACK_URL,
                amount: amount.toString(),
                currency: "BDT",
                intent: "sale",
                merchantInvoiceNumber: invoiceNumber
            };

            const response = await axios.post('/api/bkash', {
                action: 'createPayment',
                data: {
                    ...paymentRequest,
                    token: token
                }
            });

            if (response.data && response.data.bkashURL) {
                setPaymentId(response.data.paymentID);

                // Show success message and instructions
                toast.success("Payment created! Redirecting to bKash...");

                // Show instructions modal
                setTimeout(() => {
                    if (window.confirm(
                        "bKash payment page will open in a new window.\n\n" +
                        "Use these test credentials:\n" +
                        "Phone: 01770618567\n" +
                        "OTP: 123456\n" +
                        "MPIN: 12121\n\n" +
                        "Click OK to proceed."
                    )) {
                        // Open bKash payment page
                        const paymentWindow = window.open(
                            response.data.bkashURL,
                            'bKashPayment',
                            'width=500,height=700,resizable=yes,scrollbars=yes'
                        );

                        if (paymentWindow) {
                            setPaymentStatus("Initiated");

                            // Check if window closed (payment completed)
                            const checkWindow = setInterval(() => {
                                if (paymentWindow.closed) {
                                    clearInterval(checkWindow);
                                    verifyPayment(response.data.paymentID, token);
                                }
                            }, 1000);
                        }
                    }
                }, 100);

            } else {
                toast.error(response.data?.statusMessage || "Failed to create payment");
            }

        } catch (error) {
            console.error("Payment creation error:", error.response?.data || error);
            toast.error(error.response?.data?.error || "Payment creation failed");
        } finally {
            setProcessing(false);
        }
    };

    // Verify payment
    const verifyPayment = async (paymentID, token) => {
        try {
            setPaymentStatus("Verifying");

            const response = await axios.post('/api/bkash', {
                action: 'executePayment',
                data: {
                    paymentID,
                    token
                }
            });

            if (response.data && response.data.transactionStatus === "Completed") {
                // Payment successful
                await completeEnrollment(response.data);
                setPaymentStatus("Completed");
                setStep(3);
                toast.success("Payment successful!");
            } else {
                toast.error(response.data?.statusMessage || "Payment verification failed");
                setPaymentStatus("Failed");
            }

        } catch (error) {
            console.error("Verification error:", error);
            toast.error("Failed to verify payment");
            setPaymentStatus("Failed");
        }
    };

    // Function to create user account automatically
    const createUserAccount = async (userData) => {
        try {
            // Generate password from email (first character uppercase + email)
            const email = userData.email;
            const password = email.charAt(0).toUpperCase() + email.slice(1);

            const userPayload = {
                name: userData.fullname,
                email: userData.email,
                password: password,
                role: "student"
            };

            // Create user account
            const response = await axios.post(
                "http://localhost:8080/api/v1/auth/signup",
                userPayload,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.data && response.data.success) {
                return {
                    success: true,
                    userId: response.data.user?._id || response.data.data?._id,
                    data: response.data,
                    message: "User account created successfully"
                };
            } else {
                const errorMessage = response.data?.message ||
                    response.data?.error ||
                    response.data?.statusMessage ||
                    "User creation failed";
                return {
                    success: false,
                    message: errorMessage
                };
            }

        } catch (error) {
            console.error("Error creating user account:", error.response?.data || error);

            if (error.response?.status === 409) {
                // User already exists - try to get user ID from response or login
                return {
                    success: true,
                    message: "User already exists",
                    userId: TEST_USER_ID // Fallback to test ID
                };
            }

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to create user account";

            return {
                success: false,
                message: errorMessage
            };
        }
    };

    // Complete enrollment using the new backend API
    const completeEnrollment = async (paymentData) => {
        try {
            // Step 1: Create or get user account
            const userCreationResult = await createUserAccount(formData);
            
            let userId = userCreationResult.userId || TEST_USER_ID;
            
            // Prepare enrollment data for backend
            const enrollmentPayload = {
                userId: userId,
                paymentInfo: {
                    paymentId: paymentData.paymentID || paymentId,
                    transactionId: paymentData.trxID || `TRX-${Date.now()}`,
                    amount: paymentData.amount || session?.price,
                    currency: "BDT",
                    paymentMethod: "bkash",
                    paymentStatus: "completed",
                    paidAt: new Date().toISOString()
                },
                studentInfo: {
                    fullname: formData.fullname,
                    email: formData.email,
                    phone: formData.phone
                }
            };

            // Step 2: Send enrollment to backend
            const enrollmentResponse = await axios.post(
                `http://localhost:8080/api/v1/live-sessions/${sessionId}/enroll`,
                enrollmentPayload,
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (enrollmentResponse.data.success) {
                setEnrollmentResult(enrollmentResponse.data.data);
                
                // Show success messages
                if (userCreationResult.success) {
                    const password = formData.email.charAt(0).toUpperCase() + formData.email.slice(1);
                    toast.success(
                        <div>
                            ✅ Enrollment successful!<br />
                            Email: {formData.email}<br />
                            Password: {password}
                        </div>,
                        { duration: 8000 }
                    );
                } else {
                    toast.success("Enrollment successful!");
                }

                // Save to localStorage as backup
                const localEnrollment = {
                    sessionId,
                    sessionTitle: session?.title,
                    sessionPrice: session?.price,
                    studentInfo: formData,
                    paymentInfo: {
                        method: "bKash",
                        paymentId: paymentData.paymentID || paymentId,
                        transactionId: paymentData.trxID,
                        amount: paymentData.amount || session?.price,
                        status: "Completed",
                        paidAt: new Date().toISOString(),
                    },
                    enrollmentDate: new Date().toISOString(),
                    enrollmentId: enrollmentResponse.data.data?.enrollment?.enrollmentId || `LIVE-ENR-${Date.now()}`,
                    backendSaved: true
                };
                
                const enrollments = JSON.parse(localStorage.getItem('liveSessionEnrollments') || '[]');
                enrollments.push(localEnrollment);
                localStorage.setItem('liveSessionEnrollments', JSON.stringify(enrollments));

            } else {
                throw new Error(enrollmentResponse.data.message || "Enrollment failed");
            }

        } catch (error) {
            console.error("Enrollment error:", error.response?.data || error);
            
            // Fallback: Save to localStorage if backend fails
            const enrollmentData = {
                sessionId,
                sessionTitle: session?.title,
                sessionPrice: session?.price,
                studentInfo: formData,
                paymentInfo: {
                    method: "bKash",
                    paymentId: paymentData.paymentID || paymentId,
                    transactionId: paymentData.trxID,
                    amount: paymentData.amount || session?.price,
                    status: paymentData.transactionStatus || "Completed",
                    paidAt: new Date().toISOString(),
                },
                enrollmentDate: new Date().toISOString(),
                enrollmentId: `LIVE-ENR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                backendSaved: false,
                error: error.response?.data?.message || error.message
            };

            const enrollments = JSON.parse(localStorage.getItem('liveSessionEnrollments') || '[]');
            enrollments.push(enrollmentData);
            localStorage.setItem('liveSessionEnrollments', JSON.stringify(enrollments));

            toast.success(
                <div>
                    Payment successful! Enrollment saved locally.<br />
                    <button
                        onClick={() => downloadReceipt(enrollmentData)}
                        className="mt-2 underline"
                    >
                        Download Receipt
                    </button>
                </div>,
                { duration: 5000 }
            );

            setEnrollmentResult(enrollmentData);
        }
    };

    // Create downloadable receipt
    const createDownloadableReceipt = (enrollmentData) => {
        const receipt = `
    ==========================================
            LIVE SESSION ENROLLMENT RECEIPT
    ==========================================
    Enrollment ID: ${enrollmentData.enrollmentId}
    Date: ${new Date(enrollmentData.enrollmentDate).toLocaleString()}
    
    ------------------------------------------
    SESSION INFORMATION
    ------------------------------------------
    Session: ${enrollmentData.sessionTitle}
    Session ID: ${enrollmentData.sessionId}
    Price: ${enrollmentData.sessionPrice} BDT
    
    ------------------------------------------
    STUDENT INFORMATION
    ------------------------------------------
    Name: ${enrollmentData.studentInfo.fullname}
    Email: ${enrollmentData.studentInfo.email}
    Phone: ${enrollmentData.studentInfo.phone}
    
    ------------------------------------------
    PAYMENT INFORMATION
    ------------------------------------------
    Method: ${enrollmentData.paymentInfo.method}
    Payment ID: ${enrollmentData.paymentInfo.paymentId}
    Transaction ID: ${enrollmentData.paymentInfo.transactionId}
    Amount: ${enrollmentData.paymentInfo.amount} BDT
    Status: ${enrollmentData.paymentInfo.status}
    Paid At: ${new Date(enrollmentData.paymentInfo.paidAt).toLocaleString()}
    
    ------------------------------------------
    USER ACCOUNT INFORMATION
    ------------------------------------------
    Account Created: Yes
    Login Email: ${enrollmentData.studentInfo.email}
    Password: ${enrollmentData.studentInfo.email.charAt(0).toUpperCase() + enrollmentData.studentInfo.email.slice(1)}
    Role: Student
    
    ==========================================
            THANK YOU FOR REGISTERING!
    ==========================================
    Join Link: ${typeof window !== 'undefined' ? window.location.origin : ''}/live-sessions/${enrollmentData.sessionId}/join
    `;

        localStorage.setItem('lastLiveSessionReceipt', receipt);
        return receipt;
    };

    // Download receipt
    const downloadReceipt = (enrollmentData) => {
        const receipt = createDownloadableReceipt(enrollmentData);

        const blob = new Blob([receipt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `live-session-receipt-${enrollmentData.enrollmentId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Simulate successful payment (for testing)
    const simulatePaymentSuccess = async () => {
        setProcessing(true);

        await new Promise(resolve => setTimeout(resolve, 2000));

        await completeEnrollment({
            paymentID: `SIM-${Date.now()}`,
            trxID: `TRX-${Date.now()}`,
            amount: (session?.price || 1500).toString(),
            transactionStatus: "Completed"
        });

        setStep(3);
        setProcessing(false);
        toast.success("Payment simulation successful!");
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value,
        });
    };

    // Format price
    const formatPrice = (price) => {
        if (!price && price !== 0) return "Free";
        return new Intl.NumberFormat("en-BD", {
            style: "currency",
            currency: "BDT",
            minimumFractionDigits: 0,
        }).format(price);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "TBD";
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Validate step 1
    const validateStep1 = () => {
        if (!formData.fullname.trim()) {
            toast.error("Please enter your full name");
            return false;
        }
        if (!formData.email.trim()) {
            toast.error("Please enter your email");
            return false;
        }
        if (!formData.phone.trim()) {
            toast.error("Please enter your phone number");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        if (!/^(?:\+88|01)?\d{11}$/.test(formData.phone.replace(/\s+/g, ''))) {
            toast.error("Please enter a valid Bangladeshi phone number");
            return false;
        }
        return true;
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading session details...</p>
                </div>
            </div>
        );
    }

    // Check if session is free
    const isFree = session && !session.isPaid;
    
    if (isFree) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="mx-auto max-w-4xl">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-8 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Session
                    </Button>

                    <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <h1 className="mb-4 text-3xl font-bold text-gray-900">This is a Free Session!</h1>
                        <p className="mb-8 text-lg text-gray-600">
                            You can join this live session without any payment.
                        </p>
                        <Button
                            onClick={() => router.push(`/live-sessions/${sessionId}/join`)}
                            className="bg-green-600 px-8 py-6 text-lg hover:bg-green-700"
                        >
                            <Video className="mr-2 h-5 w-5" />
                            Join Session Now
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="w-fit text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <div className="flex items-center space-x-2">
                        <div className={`rounded-full px-3 py-1 text-sm ${step >= 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                            1. Personal Info
                        </div>
                        <div className="h-0.5 w-8 bg-gray-300"></div>
                        <div className={`rounded-full px-3 py-1 text-sm ${step >= 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                            2. Payment
                        </div>
                        <div className="h-0.5 w-8 bg-gray-300"></div>
                        <div className={`rounded-full px-3 py-1 text-sm ${step === 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            3. Confirmation
                        </div>
                    </div>
                </div>

                {/* Test Mode Banner */}
                {BKASH_CONFIG.IS_SANDBOX && (
                    <div className="mb-6 rounded-xl border-2 border-yellow-400 bg-yellow-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-yellow-800">bKash SANDBOX - TEST MODE</h3>
                                <p className="mt-1 text-sm text-yellow-700">
                                    This is a test environment. No real money will be charged.
                                    <button
                                        onClick={() => setShowTestInfo(!showTestInfo)}
                                        className="ml-2 text-yellow-800 underline hover:text-yellow-900"
                                    >
                                        {showTestInfo ? "Hide" : "Show"} test credentials
                                    </button>
                                </p>

                                {showTestInfo && (
                                    <div className="mt-3 rounded-lg bg-yellow-100 p-3 text-sm">
                                        <p className="font-medium text-yellow-900">Test Credentials:</p>
                                        <ul className="mt-1 space-y-1">
                                            <li>📱 Phone: <code className="rounded bg-yellow-200 px-1">{BKASH_TEST_CREDENTIALS.PHONE}</code></li>
                                            <li>🔢 OTP: <code className="rounded bg-yellow-200 px-1">{BKASH_TEST_CREDENTIALS.OTP}</code></li>
                                            <li>🔐 MPIN: <code className="rounded bg-yellow-200 px-1">{BKASH_TEST_CREDENTIALS.MPIN}</code></li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-16">
                    {/* Left Column - Session Summary */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl bg-white p-6 shadow-lg">
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">Live Session Details</h2>

                            {session && (
                                <>
                                    {/* Image/Header Area */}
                                    <div className="relative h-52 w-full overflow-hidden rounded-t-xl">
                                        {/* Gradient Background */}
                                        <div className={`absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-110 ${session.isPaid
                                            ? 'from-indigo-600 via-purple-600 to-pink-600'
                                            : 'from-emerald-500 via-teal-500 to-cyan-500'
                                            }`} />

                                        {/* Dark overlay for text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />

                                        {/* Floating Badges */}
                                        <div className="absolute left-4 top-4 z-20 flex gap-2">
                                            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                                                {session.category}
                                            </span>
                                        </div>

                                        {/* Price Tag */}
                                        <div className="absolute right-4 top-4 z-20">
                                            <div className="rounded-xl bg-white/95 px-3 py-1.5 text-sm font-bold text-slate-900 shadow-lg backdrop-blur-sm">
                                                {session.isPaid ? `$${session.discountedPrice || session.price}` : 'FREE'}
                                            </div>
                                        </div>

                                        {/* Subcategory */}
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <p className="text-xs font-medium text-white/90 drop-shadow-md">{session.subCategory}</p>
                                        </div>
                                    </div>

                                    <h3 className="mb-2 text-lg font-medium text-gray-900">{session.title}</h3>
                                    <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                                        {session.description}
                                    </p>

                                    <div className="mb-4 space-y-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            <span>{formatDate(session.schedule?.startTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-500" />
                                            <span>Duration: {session.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-blue-500" />
                                            <span>Available Seats: {session.availableSlots}/{session.totalSlots}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Video className="h-4 w-4 text-blue-500" />
                                            <span>Instructor: {session.instructor}</span>
                                        </div>
                                    </div>

                                    <div className="mb-6 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Session Price</span>
                                            <span className="text-lg font-bold text-gray-900">
                                                {formatPrice(session.price)}
                                            </span>
                                        </div>

                                        {session.price > 0 && (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Platform Fee</span>
                                                    <span className="text-gray-600">Free</span>
                                                </div>
                                                <div className="flex items-center justify-between border-t pt-3">
                                                    <span className="font-medium text-gray-900">Total Amount</span>
                                                    <span className="text-xl font-bold text-green-600">
                                                        {formatPrice(session.price)}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Test Payment Button */}
                        {BKASH_CONFIG.IS_SANDBOX && step === 2 && (
                            <div className="mt-6 rounded-2xl bg-gray-50 p-6 shadow">
                                <h3 className="mb-3 font-medium text-gray-900">Quick Test</h3>
                                <p className="mb-4 text-sm text-gray-600">
                                    Simulate payment without bKash app for testing.
                                </p>
                                <Button
                                    onClick={simulatePaymentSuccess}
                                    variant="outline"
                                    className="w-full border-gray-300"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <CreditCard className="mr-2 h-4 w-4" />
                                    )}
                                    {processing ? "Processing..." : "Simulate Payment"}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Form */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-white p-6 shadow-lg">
                            {/* Step 1: Personal Information */}
                            {step === 1 && (
                                <>
                                    <h2 className="mb-2 text-2xl font-bold text-gray-900">Personal Information</h2>
                                    <p className="mb-6 text-gray-600">
                                        Please provide your details to register for this live session.
                                        {BKASH_CONFIG.IS_SANDBOX && " Test data is pre-filled."}
                                    </p>

                                    <div className="space-y-6">
                                        <div>
                                            <Label htmlFor="fullname" className="mb-2 block text-sm font-medium text-gray-700">
                                                Full Name *
                                            </Label>
                                            <Input
                                                id="fullname"
                                                placeholder="Enter your full name"
                                                value={formData.fullname}
                                                onChange={handleInputChange}
                                                className="h-12"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                                                    Email Address *
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="h-12"
                                                />
                                                <p className="mt-2 text-sm text-gray-500">
                                                    This will be used to create your student account
                                                </p>
                                            </div>

                                            <div>
                                                <Label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                                                    Phone Number *
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    placeholder="01XXXXXXXXX"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="h-12"
                                                />
                                                <p className="mt-2 text-sm text-gray-500">
                                                    This will be used for bKash payment verification
                                                </p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-blue-50 p-4">
                                            <p className="text-sm text-blue-800">
                                                🔐 <strong>Note:</strong> A student account will be automatically created
                                                using your email. You'll receive login credentials after payment.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 2: Payment */}
                            {step === 2 && !paymentStatus && (
                                <>
                                    <h2 className="mb-2 text-2xl font-bold text-gray-900">Complete Registration</h2>
                                    <p className="mb-6 text-gray-600">
                                        Complete your payment to secure your seat.
                                        {BKASH_CONFIG.IS_SANDBOX && " Use test credentials when prompted."}
                                    </p>

                                    <div className="mb-8 rounded-xl bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                            <div className="flex-1">
                                                <div className="mb-4 flex items-center gap-3">
                                                    <div className="rounded-lg bg-white/20 p-2">
                                                        <Smartphone className="h-8 w-8" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold">Pay with bKash</h3>
                                                        <p className="text-green-100">Secure payment through bKash Sandbox</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between rounded-lg bg-green-600/50 p-3">
                                                        <span>Amount to Pay:</span>
                                                        <span className="text-xl font-bold">{formatPrice(session?.price)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between rounded-lg bg-green-600/50 p-3">
                                                        <span>Available Seats:</span>
                                                        <span className="text-xl font-bold">{session?.availableSlots}/{session?.totalSlots}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-lg bg-white/20 p-4">
                                                <p className="text-sm">Sandbox Mode</p>
                                                <p className="text-xs opacity-90">Test transaction only</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-8 space-y-6">
                                        <div>
                                            <h3 className="mb-3 font-medium text-gray-900">How to Test:</h3>
                                            <ol className="list-decimal space-y-2 pl-5 text-gray-600">
                                                <li>Click "Pay with bKash" button below</li>
                                                <li>Confirm to open bKash payment page</li>
                                                <li>Use these test credentials:
                                                    <ul className="mt-1 list-inside list-disc pl-5 text-sm text-gray-500">
                                                        <li>Phone: <code>{BKASH_TEST_CREDENTIALS.PHONE}</code></li>
                                                        <li>OTP: <code>{BKASH_TEST_CREDENTIALS.OTP}</code></li>
                                                        <li>MPIN: <code>{BKASH_TEST_CREDENTIALS.MPIN}</code></li>
                                                    </ul>
                                                </li>
                                                <li>Complete payment in bKash sandbox</li>
                                                <li>Close the bKash window to return here</li>
                                            </ol>
                                        </div>

                                        <div className="rounded-lg bg-blue-50 p-4">
                                            <p className="text-sm text-blue-800">
                                                💡 <strong>Note:</strong> After payment, you'll receive a confirmation email
                                                with the session join link and your login credentials.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Payment Processing */}
                            {step === 2 && paymentStatus && paymentStatus !== "Completed" && (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                                    </div>

                                    <h2 className="mb-4 text-2xl font-bold text-gray-900">
                                        {paymentStatus === "Initiated" || paymentStatus === "Redirected"
                                            ? "Complete Payment in bKash"
                                            : "Processing Payment..."}
                                    </h2>

                                    <p className="mb-8 text-gray-600">
                                        {paymentStatus === "Initiated" || paymentStatus === "Redirected"
                                            ? "Complete the payment in the bKash window that opened. Then close it to return here."
                                            : "Verifying your payment with bKash..."}
                                    </p>

                                    <div className="mx-auto max-w-md space-y-4 rounded-xl bg-gray-50 p-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`font-medium capitalize ${paymentStatus === "Initiated" || paymentStatus === "Redirected"
                                                ? "text-yellow-600"
                                                : "text-blue-600"
                                                }`}>
                                                {paymentStatus}
                                            </span>
                                        </div>

                                        {paymentStatus === "Initiated" || paymentStatus === "Redirected" ? (
                                            <div className="rounded-lg bg-yellow-50 p-4">
                                                <p className="text-sm text-yellow-800">
                                                    🔄 <strong>Waiting for payment completion...</strong><br />
                                                    If bKash window didn't open, check your popup blocker.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="rounded-lg bg-blue-50 p-4">
                                                <p className="text-sm text-blue-800">
                                                    ⏳ Verifying payment status...
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Success */}
                            {step === 3 && (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                        <CheckCircle className="h-12 w-12 text-green-600" />
                                    </div>

                                    <h2 className="mb-4 text-3xl font-bold text-gray-900">Registration Successful!</h2>
                                    <p className="mb-8 text-lg text-gray-600">
                                        You are now registered for <span className="font-semibold text-blue-600">{session?.title}</span>
                                    </p>

                                    <div className="mx-auto max-w-md space-y-4 rounded-xl bg-gray-50 p-6 text-left">
                                        <div className="flex justify-between border-b pb-3">
                                            <span className="text-gray-600">Session</span>
                                            <span className="font-medium">{session?.title}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-3">
                                            <span className="text-gray-600">Date & Time</span>
                                            <span className="font-medium">{formatDate(session?.schedule?.startTime)}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-3">
                                            <span className="text-gray-600">Amount Paid</span>
                                            <span className="font-bold text-green-600">{formatPrice(session?.price)}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-3">
                                            <span className="text-gray-600">Payment Method</span>
                                            <span className="font-medium">bKash {BKASH_CONFIG.IS_SANDBOX && "(Sandbox)"}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-3">
                                            <span className="text-gray-600">Your Student Account</span>
                                            <span className="font-medium">Created ✓</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Status</span>
                                            <span className="font-medium text-green-600">Completed</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-4">
                                        <Button
                                            onClick={() => router.push(`/live-sessions/${sessionId}`)}
                                            className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700"
                                        >
                                            View Session Details
                                        </Button>

                                        {/* Account Information Button */}
                                        <div className="rounded-lg bg-blue-50 p-4">
                                            <p className="text-sm font-medium text-blue-800 mb-2">Your Login Credentials:</p>
                                            <div className="text-left space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Email:</span>
                                                    <code className="rounded bg-blue-100 px-2 py-1">{formData.email}</code>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Password:</span>
                                                    <code className="rounded bg-blue-100 px-2 py-1">
                                                        {formData.email.charAt(0).toUpperCase() + formData.email.slice(1)}
                                                    </code>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Role:</span>
                                                    <span className="font-medium">Student</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Dashboard:</span>
                                                    <span className="font-medium text-blue-500 underline">
                                                        <a href="https://shekhai-dashboard.vercel.app/" target="_blank" rel="noopener noreferrer">
                                                            shekhai-dashboard.vercel.app
                                                        </a>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            onClick={() => router.push("/live-sessions")}
                                            className="w-full py-6 text-lg"
                                        >
                                            Browse More Live Sessions
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {step === 1 && (
                                <div className="mt-8 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        className="sm:px-8"
                                    >
                                        Back
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            if (validateStep1()) {
                                                setStep(2);
                                            }
                                        }}
                                        className="bg-green-600 hover:bg-green-700 sm:px-8"
                                    >
                                        Continue to Payment
                                        {BKASH_CONFIG.IS_SANDBOX && " (Test Mode)"}
                                    </Button>
                                </div>
                            )}

                            {step === 2 && !paymentStatus && (
                                <div className="mt-8 space-y-4 border-t pt-8">
                                    <Button
                                        onClick={createBkashPayment}
                                        disabled={processing}
                                        className="w-full bg-green-600 py-6 text-lg hover:bg-green-700"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Connecting to bKash...
                                            </>
                                        ) : (
                                            <>
                                                <Smartphone className="mr-2 h-5 w-5" />
                                                Pay with bKash Sandbox
                                            </>
                                        )}
                                    </Button>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <Button
                                            variant="outline"
                                            onClick={handleBack}
                                            className="py-6 text-lg"
                                        >
                                            Back to Personal Info
                                        </Button>

                                        {BKASH_CONFIG.IS_SANDBOX && (
                                            <Button
                                                onClick={simulatePaymentSuccess}
                                                variant="outline"
                                                className="py-6 text-lg border-blue-300 text-blue-700 hover:bg-blue-50"
                                                disabled={processing}
                                            >
                                                <CreditCard className="mr-2 h-5 w-5" />
                                                Simulate Payment
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Security Badge */}
                            {step !== 3 && (
                                <div className="mt-8 flex flex-col items-center justify-center gap-3 border-t pt-8 text-sm text-gray-500 sm:flex-row">
                                    <Shield className="h-5 w-5" />
                                    <span>Secure SSL encryption • Powered by bKash</span>
                                    {BKASH_CONFIG.IS_SANDBOX && (
                                        <span className="rounded-full bg-gray-200 px-2 py-1 text-xs">
                                            Sandbox Environment
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveSessionCheckout;