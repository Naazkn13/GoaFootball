import { useState, useEffect } from 'react';
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

export default function RegistrationForm({ role, formData, onChange, errors, docVerificationStatus, prefilledClubId, prefilledClubName, isClubRegistration }) {
    const roleFields = ROLE_FIELDS[role] || [];
    const [clubs, setClubs] = useState([]);
    const [addressSameAsProof, setAddressSameAsProof] = useState(false);

    // Fetch clubs
    useEffect(() => {
        fetch('/api/clubs')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setClubs(data.clubs);
                }
            })
            .catch(err => console.error("Error fetching clubs:", err));
    }, []);

    // --- Date of Birth dropdown helpers ---
    const currentYear = new Date().getFullYear();
    const MONTHS = [
        { value: '01', label: 'January' }, { value: '02', label: 'February' },
        { value: '03', label: 'March' }, { value: '04', label: 'April' },
        { value: '05', label: 'May' }, { value: '06', label: 'June' },
        { value: '07', label: 'July' }, { value: '08', label: 'August' },
        { value: '09', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' },
    ];

    // Use separate fields for partial selection so dropdowns always reflect values
    const dobDay = formData._dob_day || '';
    const dobMonth = formData._dob_month || '';
    const dobYear = formData._dob_year || '';

    // Calculate max days for selected month/year
    const getDaysInMonth = (month, year) => {
        if (!month) return 31;
        return new Date(year || 2000, parseInt(month), 0).getDate();
    };
    const maxDays = getDaysInMonth(dobMonth, dobYear);

    // When any dropdown changes, update individual fields + combined date_of_birth
    const handleDobChange = (part, value) => {
        let y = dobYear, m = dobMonth, d = dobDay;
        if (part === 'year') y = value;
        if (part === 'month') m = value;
        if (part === 'day') d = value;

        // Auto-clamp day if month changed and day exceeds new max
        if (d && m) {
            const newMax = getDaysInMonth(m, y);
            if (parseInt(d) > newMax) d = String(newMax).padStart(2, '0');
        }

        const combined = (y && m && d) ? `${y}-${m}-${d}` : '';
        onChange({
            ...formData,
            _dob_day: d,
            _dob_month: m,
            _dob_year: y,
            date_of_birth: combined,
        });
    };

    const handleChange = (field, value) => {
        onChange({ ...formData, [field]: value });
    };

    const handleRoleDetailChange = (field, value) => {
        onChange({
            ...formData,
            role_details: { ...formData.role_details, [field]: value },
        });
    };

    const handleAddressSameAsProofChange = (e) => {
        const checked = e.target.checked;
        setAddressSameAsProof(checked);
        // Clear address fields if checked
        if (checked) {
            onChange({
                ...formData,
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                pin_code: '',
            });
        }
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
                {/* Select Club (Mandatory) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label htmlFor="reg-club">Select Club *</label>
                    {prefilledClubId ? (
                        <input
                            type="text"
                            value={prefilledClubName || 'Registered via Club Dashboard'}
                            disabled
                            style={{ backgroundColor: '#e5e7eb', color: '#6b7280', cursor: 'not-allowed' }}
                        />
                    ) : (
                        <select
                            id="reg-club"
                            value={formData.club_id || ''}
                            onChange={(e) => handleChange('club_id', e.target.value)}
                            required
                        >
                            <option value="">Select a Club</option>
                            {clubs.map((club) => (
                                <option key={club.id} value={club.id}>{club.name}</option>
                            ))}
                        </select>
                    )}
                    {errors?.club_id && <span className={styles.fieldError}>{errors.club_id}</span>}
                </div>

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

                {isClubRegistration && (
                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-email">Email Address *</label>
                        <input
                            id="reg-email"
                            type="email"
                            placeholder={`${role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Player'}'s email address`}
                            value={formData.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required
                        />
                        {errors?.email && <span className={styles.fieldError}>{errors.email}</span>}
                    </div>
                )}

                <div className={styles.inputGroup}>
                    <label>Date of Birth *</label>
                    <div className={styles.dobDropdownRow}>
                        <select
                            id="reg-dob-day"
                            value={dobDay}
                            onChange={(e) => handleDobChange('day', e.target.value)}
                            required
                            aria-label="Day"
                        >
                            <option value="">Day</option>
                            {Array.from({ length: maxDays }, (_, i) => {
                                const d = String(i + 1).padStart(2, '0');
                                return <option key={d} value={d}>{i + 1}</option>;
                            })}
                        </select>

                        <select
                            id="reg-dob-month"
                            value={dobMonth}
                            onChange={(e) => handleDobChange('month', e.target.value)}
                            required
                            aria-label="Month"
                        >
                            <option value="">Month</option>
                            {MONTHS.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>

                        <select
                            id="reg-dob-year"
                            value={dobYear}
                            onChange={(e) => handleDobChange('year', e.target.value)}
                            required
                            aria-label="Year"
                        >
                            <option value="">Year</option>
                            {Array.from({ length: currentYear - 1950 + 1 }, (_, i) => {
                                const y = currentYear - i;
                                return <option key={y} value={String(y)}>{y}</option>;
                            })}
                        </select>
                    </div>
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
            </div>

            {/* Address */}
            <h3 className={styles.stepTitle} style={{ marginTop: '2rem' }}>Address</h3>

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                    type="checkbox"
                    id="address-same"
                    checked={addressSameAsProof}
                    onChange={handleAddressSameAsProofChange}
                    style={{ cursor: 'pointer', width: '1rem', height: '1rem' }}
                />
                <label htmlFor="address-same" style={{ cursor: 'pointer', margin: 0, fontWeight: 'normal' }}>
                    Address same as proofs
                </label>
            </div>

            {!addressSameAsProof && (
                <div className={styles.formGrid}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label htmlFor="reg-address1">Address Line 1 *</label>
                        <input
                            id="reg-address1"
                            type="text"
                            placeholder="Street address"
                            value={formData.address_line1 || ''}
                            onChange={(e) => handleChange('address_line1', e.target.value)}
                            required={!addressSameAsProof}
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
                            required={!addressSameAsProof}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-state">State *</label>
                        <select
                            id="reg-state"
                            value={formData.state || ''}
                            onChange={(e) => handleChange('state', e.target.value)}
                            required={!addressSameAsProof}
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
                            placeholder="Up to 10-digit PIN"
                            value={formData.pin_code || ''}
                            onChange={(e) => handleChange('pin_code', e.target.value)}
                            pattern="[0-9]{1,10}"
                            maxLength="10"
                            required={!addressSameAsProof}
                        />
                    </div>
                </div>
            )}

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

                <div className={styles.inputGroup}>
                    <label htmlFor="reg-consent">GFF Consent Form * (PDF, max 5MB)</label>
                    <input
                        id="reg-consent"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleChange('gff_consent_form_file', e.target.files[0])}
                        required
                        className={styles.fileInput}
                    />
                    {renderVerifyStatus('gff_consent_form')}
                    {errors?.gff_consent_form && <span className={styles.fieldError}>{errors.gff_consent_form}</span>}
                </div>
            </div>
        </div>
    );
}

