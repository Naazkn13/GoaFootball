import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import styles from '@/styles/Register.module.css';
import RoleSelectionForm from '@/components/RoleSelectionForm';
import RegistrationForm from '@/components/RegistrationForm';
import axiosInstance from '@/services/axios';
import paymentAPI from '@/services/api/payment.api';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Role, 2: Form, 3: Payment
    const [selectedRole, setSelectedRole] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        date_of_birth: '',
        gender: '',
        email: '',
        aadhaar: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pin_code: '',
        address_same_as_proof: false,
        role_details: {},
        photo_file: null,
        id_proof_file: null,
        birth_certificate_file: null,
        gff_consent_form_file: null,
        club_id: router.query.club_id || '',
    });
    const [isClubRegistration, setIsClubRegistration] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState('');

    // Check if a club is registering
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get('/api/user/profile');
                if (res.data?.user?.role === 'club') {
                    setIsClubRegistration(true);
                }
            } catch (err) {
                // Not logged in or not a club
            }
        };
        fetchProfile();
    }, []);

    // Step 1 → Step 2
    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setStep(2);
    };



    // Validate form data
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name || formData.name.length < 2) {
            newErrors.name = 'Full name is required (min 2 characters)';
        }

        // Ensure club is selected (unless prefilled from Dashbaord, which we init in state)
        if (!formData.club_id) {
            newErrors.club_id = 'You must select a club to register under';
        }
        if (!formData.date_of_birth) {
            newErrors.date_of_birth = 'Date of birth is required';
        } else {
            const age = (new Date() - new Date(formData.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000);
            if (age < 10) newErrors.date_of_birth = 'Must be at least 10 years old';
        }
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Valid 10-digit phone number is required';
        }

        // Only require email if a club is registering them
        if (isClubRegistration && (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))) {
            newErrors.email = 'Valid email is required';
        }

        // We check address info only if we don't have "Address same as proofs" active
        // (If it was checked, the component cleared these fields, but we should just ensure they are non-empty if required)
        if (!formData.address_same_as_proof) {
            if (!formData.address_line1) newErrors.address_line1 = 'Address is required';
            if (!formData.city) newErrors.city = 'City is required';
            if (!formData.state) newErrors.state = 'State is required';
            if (!formData.pin_code || !/^[0-9]{1,10}$/.test(formData.pin_code)) {
                newErrors.pin_code = 'Valid PIN code is required (up to 10 digits)';
            }
        }

        if (!formData.photo_file) newErrors.photo = 'Passport-size photo is required';
        if (!formData.id_proof_file) newErrors.id_proof = 'ID proof document is required';
        if (!formData.birth_certificate_file) newErrors.birth_certificate = 'Birth certificate is required';
        if (!formData.gff_consent_form_file) newErrors.gff_consent_form = 'GFF consent form is required';

        // Validate photo size (max 2MB)
        if (formData.photo_file && formData.photo_file.size > 2 * 1024 * 1024) {
            newErrors.photo = 'Photo must be less than 2MB';
        }
        // Validate ID proof size (max 5MB)
        if (formData.id_proof_file && formData.id_proof_file.size > 5 * 1024 * 1024) {
            newErrors.id_proof = 'ID proof must be less than 5MB';
        }
        // Validate birth certificate size (max 5MB)
        if (formData.birth_certificate_file && formData.birth_certificate_file.size > 5 * 1024 * 1024) {
            newErrors.birth_certificate = 'Birth certificate must be less than 5MB';
        }
        // Validate GFF consent form size (max 5MB)
        if (formData.gff_consent_form_file && formData.gff_consent_form_file.size > 5 * 1024 * 1024) {
            newErrors.gff_consent_form = 'GFF consent form must be less than 5MB';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Upload a document file
    const uploadDocument = async (file, docType) => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('documentType', docType);

        const response = await axiosInstance.post('/api/user/upload-document', formDataUpload, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    };

    // Step 2 → Step 3 (Submit form + proceed to pay)
    const handleSubmitAndPay = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (!validateForm()) {
            setError('Please fix the errors above before proceeding.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Upload documents
            setUploadProgress('Uploading photo...');
            const photoResult = await uploadDocument(formData.photo_file, 'photo');

            setUploadProgress('Uploading ID proof...');
            const idProofResult = await uploadDocument(formData.id_proof_file, 'id_proof');

            setUploadProgress('Uploading birth certificate...');
            const birthCertResult = await uploadDocument(formData.birth_certificate_file, 'birth_certificate');

            setUploadProgress('Uploading GFF consent form...');
            const consentResult = await uploadDocument(formData.gff_consent_form_file, 'gff_consent_form');

            // 3. Submit registration data
            setUploadProgress('Saving registration...');
            const registrationPayload = {
                name: formData.name,
                email: isClubRegistration ? formData.email : undefined,
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                phone: formData.phone,
                role: selectedRole,
                club_id: formData.club_id,
                role_details: formData.role_details,
                address: {
                    line1: formData.address_line1 || 'Same as proof',
                    line2: formData.address_line2 || '',
                    city: formData.city || 'Same as proof',
                    state: formData.state || 'Same as proof',
                    pin_code: formData.pin_code || '000000',
                },
                documents: [
                    { type: 'photo', url: photoResult.url, filename: photoResult.filename },
                    { type: 'id_proof', url: idProofResult.url, filename: idProofResult.filename },
                    { type: 'birth_certificate', url: birthCertResult.url, filename: birthCertResult.filename },
                    { type: 'gff_consent_form', url: consentResult.url, filename: consentResult.filename },
                ],
                profile_photo_url: photoResult.url,
            };

            const registerResponse = await axiosInstance.post('/api/user/register', registrationPayload);
            const registeredUserId = registerResponse.data?.user?.id;

            // 4. Proceed to payment
            setUploadProgress('Initiating payment...');
            const orderResponse = await paymentAPI.createOrder(registeredUserId);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderResponse.order.amount, // Already in paise from server
                currency: orderResponse.order.currency,
                name: 'Football Registration',
                description: 'Registration Payment',
                order_id: orderResponse.order.id,
                handler: async function (response) {
                    try {
                        await paymentAPI.verifyPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        // Success → redirect to profile
                        router.push('/profile');
                    } catch (err) {
                        setError('Payment verification failed. Please contact support.');
                    } finally {
                        setLoading(false);
                        setUploadProgress('');
                    }
                },
                prefill: {
                    name: formData.name,
                    contact: formData.phone,
                },
                theme: { color: '#1a56db' },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function () {
                setError('Payment failed. Please try again.');
                setLoading(false);
                setUploadProgress('');
            });
            razorpay.open();
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setLoading(false);
            setUploadProgress('');
        }
    };

    return (
        <>
            <Head>
                <title>Register — Football Registration</title>
                <meta name="description" content="Complete your football registration" />
            </Head>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className={styles.registerContainer}>
                <div className={styles.registerCard}>
                    {/* Progress Steps */}
                    <div className={styles.progressBar}>
                        <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ''}`}>
                            <span className={styles.stepNumber}>1</span>
                            <span className={styles.stepLabel}>Role</span>
                        </div>
                        <div className={styles.progressLine} />
                        <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`}>
                            <span className={styles.stepNumber}>2</span>
                            <span className={styles.stepLabel}>Details</span>
                        </div>
                        <div className={styles.progressLine} />
                        <div className={`${styles.progressStep} ${step >= 3 ? styles.active : ''}`}>
                            <span className={styles.stepNumber}>3</span>
                            <span className={styles.stepLabel}>Payment</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    {uploadProgress && <div className={styles.progressMessage}>{uploadProgress}</div>}

                    {/* Step 1: Role Selection */}
                    {step === 1 && (
                        <RoleSelectionForm
                            selectedRole={selectedRole}
                            onSelectRole={handleRoleSelect}
                        />
                    )}

                    {/* Step 2: Registration Form + Documents */}
                    {step === 2 && (
                        <form onSubmit={handleSubmitAndPay}>
                            <RegistrationForm
                                role={selectedRole}
                                formData={formData}
                                onChange={setFormData}
                                errors={errors}
                                prefilledClubId={router.query.club_id}
                                prefilledClubName={router.query.club_name}
                                isClubRegistration={isClubRegistration}
                            />

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.backBtn}
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className={styles.spinner} />
                                            Processing...
                                        </>
                                    ) : (
                                        'Proceed to Pay →'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
