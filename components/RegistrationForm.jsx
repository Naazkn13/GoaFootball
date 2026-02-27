import { useState } from 'react';
import styles from '@/styles/Register.module.css';

// Indian states list
const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// Role-specific field definitions (athlete has no extra fields)
const ROLE_FIELDS = {
    athlete: [],
    coach: [
        { name: 'specialization', label: 'Specialization', type: 'select', options: ['Youth', 'Senior', 'Goalkeeping', 'Fitness'], required: true },
        { name: 'years_experience', label: 'Years of Experience', type: 'number', required: true },
        { name: 'previous_club', label: 'Previous Club/Academy', type: 'text', required: false },
    ],
    referee: [
        { name: 'grade_level', label: 'Grade/Level', type: 'select', options: ['District', 'State', 'National', 'FIFA'], required: true },
        { name: 'years_experience', label: 'Years of Experience', type: 'number', required: true },
    ],
};

export default function RegistrationForm({ role, formData, onChange, errors, docVerificationStatus }) {
    const roleFields = ROLE_FIELDS[role] || [];

    const handleChange = (field, value) => {
        onChange({ ...formData, [field]: value });
    };

    const handleRoleDetailChange = (field, value) => {
        onChange({
            ...formData,
            role_details: { ...formData.role_details, [field]: value },
        });
    };

    // Helper to render verification status badge
    const renderVerifyStatus = (docType) => {
        const status = docVerificationStatus?.[docType];
        if (!status) return null;
        if (status.loading) {
            return <span className={styles.verifyBadge + ' ' + styles.verifyLoading}>⏳ Verifying...</span>;
        }
        if (status.verified === true) {
            return <span className={styles.verifyBadge + ' ' + styles.verifySuccess}>✅ Verified</span>;
        }
        if (status.verified === false) {
            return <span className={styles.verifyBadge + ' ' + styles.verifyError}>❌ {status.reason}</span>;
        }
        return null;
    };

    return (
        <div className={styles.formSection}>
            {/* Common Fields */}
            <h3 className={styles.stepTitle}>Personal Information</h3>

            <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                    <label htmlFor="reg-name">Full Name *</label>
                    <input
                        id="reg-name"
                        type="text"
                        placeholder="Your full name"
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                    />
                    {errors?.name && <span className={styles.fieldError}>{errors.name}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="reg-dob">Date of Birth *</label>
                    <input
                        id="reg-dob"
                        type="date"
                        value={formData.date_of_birth || ''}
                        onChange={(e) => handleChange('date_of_birth', e.target.value)}
                        required
                    />
                    {errors?.date_of_birth && <span className={styles.fieldError}>{errors.date_of_birth}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="reg-gender">Gender *</label>
                    <select
                        id="reg-gender"
                        value={formData.gender || ''}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    {errors?.gender && <span className={styles.fieldError}>{errors.gender}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="reg-phone">Phone Number *</label>
                    <input
                        id="reg-phone"
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={formData.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        pattern="[0-9]{10}"
                        maxLength="10"
                        required
                    />
                    {errors?.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="reg-aadhaar">Aadhaar Number *</label>
                    <input
                        id="reg-aadhaar"
                        type="text"
                        placeholder="12-digit Aadhaar number"
                        value={formData.aadhaar || ''}
                        onChange={(e) => handleChange('aadhaar', e.target.value)}
                        pattern="[0-9]{12}"
                        maxLength="12"
                        required
                    />
                    {errors?.aadhaar && <span className={styles.fieldError}>{errors.aadhaar}</span>}
                </div>
            </div>

            {/* Address */}
            <h3 className={styles.stepTitle} style={{ marginTop: '2rem' }}>Address</h3>

            <div className={styles.formGrid}>
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label htmlFor="reg-address1">Address Line 1 *</label>
                    <input
                        id="reg-address1"
                        type="text"
                        placeholder="Street address"
                        value={formData.address_line1 || ''}
                        onChange={(e) => handleChange('address_line1', e.target.value)}
                        required
                    />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label htmlFor="reg-address2">Address Line 2</label>
                    <input
                        id="reg-address2"
                        type="text"
                        placeholder="Apartment, suite, etc. (optional)"
                        value={formData.address_line2 || ''}
                        onChange={(e) => handleChange('address_line2', e.target.value)}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="reg-city">City *</label>
                    <input
                        id="reg-city"
                        type="text"
                        placeholder="City"
                        value={formData.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="reg-state">State *</label>
                    <select
                        id="reg-state"
                        value={formData.state || ''}
                        onChange={(e) => handleChange('state', e.target.value)}
                        required
                    >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="reg-pin">PIN Code *</label>
                    <input
                        id="reg-pin"
                        type="text"
                        placeholder="6-digit PIN"
                        value={formData.pin_code || ''}
                        onChange={(e) => handleChange('pin_code', e.target.value)}
                        pattern="[0-9]{6}"
                        maxLength="6"
                        required
                    />
                </div>
            </div>

            {/* Role-Specific Fields (only for coach/referee) */}
            {roleFields.length > 0 && (
                <>
                    <h3 className={styles.stepTitle} style={{ marginTop: '2rem' }}>
                        {role.charAt(0).toUpperCase() + role.slice(1)} Details
                    </h3>

                    <div className={styles.formGrid}>
                        {roleFields.map((field) => (
                            <div key={field.name} className={styles.inputGroup}>
                                <label htmlFor={`reg-${field.name}`}>
                                    {field.label} {field.required ? '*' : ''}
                                </label>

                                {field.type === 'select' ? (
                                    <select
                                        id={`reg-${field.name}`}
                                        value={formData.role_details?.[field.name] || ''}
                                        onChange={(e) => handleRoleDetailChange(field.name, e.target.value)}
                                        required={field.required}
                                    >
                                        <option value="">Select {field.label}</option>
                                        {field.options.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        id={`reg-${field.name}`}
                                        type={field.type}
                                        placeholder={field.label}
                                        value={formData.role_details?.[field.name] || ''}
                                        onChange={(e) => handleRoleDetailChange(field.name, e.target.value)}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Document Uploads */}
            <h3 className={styles.stepTitle} style={{ marginTop: '2rem' }}>Documents</h3>

            <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                    <label htmlFor="reg-photo">Passport-size Photo * (JPEG/PNG, max 2MB)</label>
                    <input
                        id="reg-photo"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => handleChange('photo_file', e.target.files[0])}
                        required
                        className={styles.fileInput}
                    />
                    {renderVerifyStatus('photo')}
                    {errors?.photo && <span className={styles.fieldError}>{errors.photo}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="reg-idproof">ID Proof (Aadhaar/PAN) * (PDF/JPEG/PNG, max 5MB)</label>
                    <input
                        id="reg-idproof"
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleChange('id_proof_file', e.target.files[0])}
                        required
                        className={styles.fileInput}
                    />
                    {renderVerifyStatus('id_proof')}
                    {errors?.id_proof && <span className={styles.fieldError}>{errors.id_proof}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="reg-birthcert">Birth Certificate * (PDF/JPEG/PNG, max 5MB)</label>
                    <input
                        id="reg-birthcert"
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleChange('birth_certificate_file', e.target.files[0])}
                        required
                        className={styles.fileInput}
                    />
                    {renderVerifyStatus('birth_certificate')}
                    {errors?.birth_certificate && <span className={styles.fieldError}>{errors.birth_certificate}</span>}
                </div>
            </div>
        </div>
    );
}

