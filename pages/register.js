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
    const [step, setStep] = useState(1); // 1: Role, 2: Details, 3: Documents, 4: Payment
    const [selectedRole, setSelectedRole] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        only_first_name: false,
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
        accepted_tc: false,
        club_id: router.query.club_id || '',
    });
    const [isClubRegistration, setIsClubRegistration] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState('');
    const [isAlreadyPaid, setIsAlreadyPaid] = useState(false);

    // Check if a club is registering
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get('/api/user/profile');
                if (res.data?.user) {
                    if (res.data.user.role === 'club') {
                        setIsClubRegistration(true);
                    }
                    if (res.data.user.is_paid) {
                        setIsAlreadyPaid(true);
                    }
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
    // Validate Details (Step 2)
    const validateDetails = () => {
        const newErrors = {};

        if (!formData.first_name || formData.first_name.trim().length < 2) {
            newErrors.first_name = 'First name is required (min 2 characters)';
        }

        if (!formData.club_id) {
            newErrors.club_id = 'You must select a club to register under';
        }

        if (!formData.date_of_birth) {
            newErrors.date_of_birth = 'Date of birth is required';
        } else {
            const age = (new Date() - new Date(formData.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000);
            if (age < 5) newErrors.date_of_birth = 'Must be at least 5 years old';
        }

        if (!formData.gender) newErrors.gender = 'Gender is required';
        
        if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Valid 10-digit phone number is required';
        }

        if (isClubRegistration && (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))) {
            newErrors.email = 'Valid email is required';
        }

        if (!formData.address_same_as_proof) {
            if (!formData.address_line1) newErrors.address_line1 = 'Address is required';
            if (!formData.city) newErrors.city = 'City is required';
            if (!formData.state) newErrors.state = 'State is required';
            if (!formData.pin_code || !/^[0-9]{1,10}$/.test(formData.pin_code)) {
                newErrors.pin_code = 'Valid PIN code is required (up to 10 digits)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate Documents (Step 3)
    const validateDocuments = () => {
        const newErrors = {};

        if (!formData.photo_file) newErrors.photo = 'Passport-size photo is required';
        if (!formData.id_proof_file) newErrors.id_proof = 'ID proof document is required';
        if (!formData.birth_certificate_file) newErrors.birth_certificate = 'Birth certificate is required';

        const isAthlete = selectedRole.toLowerCase() === 'athlete' || selectedRole.toLowerCase() === 'player';
        let age = 100;
        if (formData.date_of_birth) {
            age = (new Date() - new Date(formData.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000);
        }
        const requireConsent = isAthlete && age < 18;

        if (requireConsent && !formData.gff_consent_form_file) {
            newErrors.gff_consent_form = 'GFF consent form is required for athletes under 18';
        }

        if (formData.photo_file && formData.photo_file.size > 2 * 1024 * 1024) newErrors.photo = 'Photo must be less than 2MB';
        if (formData.id_proof_file && formData.id_proof_file.size > 5 * 1024 * 1024) newErrors.id_proof = 'ID proof must be less than 5MB';
        if (formData.birth_certificate_file && formData.birth_certificate_file.size > 5 * 1024 * 1024) newErrors.birth_certificate = 'Birth certificate must be less than 5MB';
        
        if (requireConsent && formData.gff_consent_form_file) {
            if (formData.gff_consent_form_file.size > 5 * 1024 * 1024) newErrors.gff_consent_form = 'Consent form must be less than 5MB';
            if (formData.gff_consent_form_file.type !== 'application/pdf') newErrors.gff_consent_form = 'Consent form must be a PDF file';
        }

        if (!requireConsent && !formData.accepted_tc) {
            newErrors.accepted_tc = 'You must accept the Terms and Conditions to proceed.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextDetails = () => {
        if (!validateDetails()) {
            setError('Please correct the errors in your details before proceeding.');
            return;
        }
        setError('');
        setStep(3);
    };

    // Upload a document file with explicit error handling
    const DOC_LABELS = {
        photo: 'Passport Photo',
        id_proof: 'ID Proof',
        birth_certificate: 'Birth Certificate',
        gff_consent_form: 'GFF Consent Form',
    };

    const uploadDocument = async (file, docType) => {
        const label = DOC_LABELS[docType] || docType;

        // Pre-flight size check before even hitting the server
        const maxSize = docType === 'photo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error(`${label} is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed: ${maxSize / (1024 * 1024)}MB. Please compress or choose a smaller file.`);
        }

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('documentType', docType);

            const response = await axiosInstance.post('/api/user/upload-document', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000, // 60s timeout for large files
            });

            if (!response.data?.url) {
                throw new Error(`${label} uploaded but server did not return a file URL. Please try again.`);
            }

            return response.data;
        } catch (err) {
            // Build a user-friendly message
            const serverMsg = err.response?.data?.message;
            if (serverMsg) {
                throw new Error(`${label} upload failed: ${serverMsg}`);
            }
            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                throw new Error(`${label} upload timed out. The file may be too large. Please compress and try again.`);
            }
            if (!err.response) {
                throw new Error(`${label} upload failed: Network error. Please check your connection and try again.`);
            }
            throw new Error(`${label} upload failed: ${err.message || 'Unknown error'}`);
        }
    };

    // Step 3 → Step 4 (Submit form + proceed to pay)
    const handleSubmitAndPay = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (!validateDocuments()) {
            setError('Please upload all required documents correctly before proceeding to payment.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Upload documents one by one with clear progress
            setUploadProgress('Uploading Passport Photo (1/4)...');
            const photoResult = await uploadDocument(formData.photo_file, 'photo');

            setUploadProgress('Uploading ID Proof (2/4)...');
            const idProofResult = await uploadDocument(formData.id_proof_file, 'id_proof');            setUploadProgress('Uploading Birth Certificate (3/4)...');
            const birthCertResult = await uploadDocument(formData.birth_certificate_file, 'birth_certificate');

            let consentResult = null;
            if (formData.gff_consent_form_file) {
                setUploadProgress('Uploading GFF Consent Form (4/4)...');
                consentResult = await uploadDocument(formData.gff_consent_form_file, 'gff_consent_form');
            }

            // 3. Submit registration data
            setUploadProgress('Saving registration...');
            
            const nameParts = formData.only_first_name 
                ? [formData.first_name]
                : [formData.first_name, formData.middle_name, formData.last_name].filter(Boolean);

            const documentList = [
                { type: 'photo', url: photoResult.url, filename: photoResult.filename },
                { type: 'id_proof', url: idProofResult.url, filename: idProofResult.filename },
                { type: 'birth_certificate', url: birthCertResult.url, filename: birthCertResult.filename },
            ];

            if (consentResult) {
                documentList.push({ type: 'gff_consent_form', url: consentResult.url, filename: consentResult.filename });
            }

            const registrationPayload = {
                first_name: formData.first_name,
                middle_name: formData.only_first_name ? null : (formData.middle_name || ''),
                last_name: formData.only_first_name ? null : (formData.last_name || ''),
                name: nameParts.join(' '),
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
                documents: documentList,
                profile_photo_url: photoResult.url,
            };

            const registerResponse = await axiosInstance.post('/api/user/register', registrationPayload);
            const registeredUserId = registerResponse.data?.user?.id;

            // 4. Proceed to payment OR skip if already paid
            if (isAlreadyPaid) {
                setUploadProgress('Re-registration complete!');
                router.push('/profile');
                return;
            }

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
                    name: [formData.first_name, formData.middle_name, formData.last_name].filter(Boolean).join(' '),
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
            // Show specific error message from upload/registration failures
            const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
            setError(message);
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
                            <span className={styles.stepLabel}>Documents</span>
                        </div>
                        <div className={styles.progressLine} />
                        <div className={`${styles.progressStep} ${step >= 4 ? styles.active : ''}`}>
                            <span className={styles.stepNumber}>4</span>
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

                    {/* Step 2: Personal Details Form */}
                    {step === 2 && (
                        <div>
                            <RegistrationForm
                                role={selectedRole}
                                formData={formData}
                                onChange={setFormData}
                                errors={errors}
                                prefilledClubId={router.query.club_id}
                                prefilledClubName={router.query.club_name}
                                isClubRegistration={isClubRegistration}
                                formStep={1}
                            />

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.backBtn}
                                    onClick={() => setStep(1)}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="button"
                                    className={styles.submitBtn}
                                    onClick={handleNextDetails}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Documents Upload & Final Submit */}
                    {step === 3 && (
                        <form onSubmit={handleSubmitAndPay}>
                            <RegistrationForm
                                role={selectedRole}
                                formData={formData}
                                onChange={setFormData}
                                errors={errors}
                                prefilledClubId={router.query.club_id}
                                prefilledClubName={router.query.club_name}
                                isClubRegistration={isClubRegistration}
                                formStep={2}
                            />

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.backBtn}
                                    onClick={() => setStep(2)}
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
                                        isAlreadyPaid ? 'Submit Re-Registration' : 'Proceed to Pay →'
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
