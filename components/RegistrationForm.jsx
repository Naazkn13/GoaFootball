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

export default function RegistrationForm({ role, formData, onChange, errors, prefilledClubId, prefilledClubName, isClubRegistration, formStep }) {
    const roleFields = ROLE_FIELDS[role] || [];
    const [clubs, setClubs] = useState([]);
    const [fileError, setFileError] = useState('');
    const addressSameAsProof = formData.address_same_as_proof || false;

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
        let intVal = parseInt(value, 10);
        let strVal = value.trim();

        // If the user typed non-numbers (e.g. 'e', '-', '.'), ignore it.
        if (strVal !== '' && isNaN(intVal)) return; 
        
        let y = dobYear, m = dobMonth, d = dobDay;

        if (part === 'day') {
            if (strVal === '') d = '';
            else {
                if (intVal > 31) return; // Disallow typing > 31
                d = String(intVal);
            }
        } else if (part === 'month') {
            if (strVal === '') m = '';
            else {
                if (intVal > 12) return; // Disallow typing > 12
                m = String(intVal);
            }
        } else if (part === 'year') {
            if (strVal === '') y = '';
            else {
                if (strVal.length > 4) return; // Disallow > 4 digits length
                if (strVal.length === 4 && intVal > currentYear) return; // Disallow future years
                y = String(intVal);
            }
        }

        // Auto-clamp day if month changed and day exceeds new max
        // Only clamp if full date is somewhat formed, or if changing month/year
        if (d && m && part !== 'day') {
            const newMax = getDaysInMonth(m, y || currentYear);
            if (parseInt(d) > newMax) d = String(newMax);
        }

        // Only commit fully formed dates to the backend payload string
        const isComplete = (y && y.length === 4 && m && d);
        const combined = isComplete ? `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` : '';

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
        // Clear address fields if checked
        if (checked) {
            onChange({
                ...formData,
                address_same_as_proof: true,
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                pin_code: '',
            });
        } else {
            onChange({
                ...formData,
                address_same_as_proof: false,
            });
        }
    };

    return (
        <div className={styles.formSection}>
            {formStep === 1 && (
                <>
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
                    <label htmlFor="reg-first-name">First Name *</label>
                    <input
                        id="reg-first-name"
                        type="text"
                        placeholder="First name"
                        value={formData.first_name || ''}
                        onChange={(e) => handleChange('first_name', e.target.value)}
                        required
                    />
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="only-first-name"
                            checked={formData.only_first_name || false}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                if (checked) {
                                    onChange({ ...formData, only_first_name: true, middle_name: '', last_name: '' });
                                } else {
                                    onChange({ ...formData, only_first_name: false });
                                }
                            }}
                            style={{ cursor: 'pointer', width: '1rem', height: '1rem' }}
                        />
                        <label htmlFor="only-first-name" style={{ cursor: 'pointer', margin: 0, fontWeight: 'normal', fontSize: '0.85rem' }}>
                            I only have a first name
                        </label>
                    </div>
                    {errors?.first_name && <span className={styles.fieldError}>{errors.first_name}</span>}
                </div>

                {!formData.only_first_name && (
                    <>
                        <div className={styles.inputGroup}>
                            <label htmlFor="reg-middle-name">Middle Name</label>
                            <input
                                id="reg-middle-name"
                                type="text"
                                placeholder="Middle name (optional)"
                                value={formData.middle_name || ''}
                                onChange={(e) => handleChange('middle_name', e.target.value)}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="reg-last-name">Last Name</label>
                            <input
                                id="reg-last-name"
                                type="text"
                                placeholder="Last name (optional)"
                                value={formData.last_name || ''}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                            />
                        </div>
                    </>
                )}

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
                        <input
                            type="number"
                            list="dob-days-list"
                            id="reg-dob-day"
                            value={dobDay}
                            onChange={(e) => handleDobChange('day', e.target.value)}
                            required
                            placeholder="DD"
                            min="1"
                            max={maxDays}
                            aria-label="Day"
                            style={{ flex: 1, padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
                        />
                        <datalist id="dob-days-list">
                            {Array.from({ length: maxDays }, (_, i) => (
                                <option key={i} value={i + 1} />
                            ))}
                        </datalist>

                        <input
                            type="number"
                            list="dob-months-list"
                            id="reg-dob-month"
                            value={dobMonth}
                            onChange={(e) => handleDobChange('month', e.target.value)}
                            required
                            placeholder="MM"
                            min="1"
                            max="12"
                            aria-label="Month"
                            style={{ flex: 1, padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
                        />
                        <datalist id="dob-months-list">
                            {MONTHS.map((m) => (
                                <option key={m.value} value={parseInt(m.value, 10)} label={m.label} />
                            ))}
                        </datalist>

                        <input
                            type="number"
                            list="dob-years-list"
                            id="reg-dob-year"
                            value={dobYear}
                            onChange={(e) => handleDobChange('year', e.target.value)}
                            required
                            placeholder="YYYY"
                            min="1900"
                            max={currentYear}
                            aria-label="Year"
                            style={{ flex: 1, padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
                        />
                        <datalist id="dob-years-list">
                            {Array.from({ length: currentYear - 1950 + 1 }, (_, i) => {
                                const y = currentYear - i;
                                return <option key={y} value={y} />;
                            })}
                        </datalist>
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
            </>
            )}

            {formStep === 2 && (
                <>
            {/* Document Uploads */}
            <h3 className={styles.stepTitle} style={{ marginTop: '0' }}>Documents</h3>

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

                    {errors?.birth_certificate && <span className={styles.fieldError}>{errors.birth_certificate}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="reg-consent">GFF Consent Form * (PDF, max 5MB)</label>
                    <input
                        id="reg-consent"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && file.type !== 'application/pdf') {
                                setFileError('Please select a valid PDF file for the GFF Consent Form.');
                                e.target.value = ''; // clear input
                                handleChange('gff_consent_form_file', null);
                            } else {
                                handleChange('gff_consent_form_file', file);
                            }
                        }}
                        required
                        className={styles.fileInput}
                    />

                    {errors?.gff_consent_form && <span className={styles.fieldError}>{errors.gff_consent_form}</span>}
                </div>
            </div>
            </>
            )}

            {/* Custom Error Modal */}
            {fileError && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'white', padding: '32px 24px', borderRadius: '16px',
                        maxWidth: '400px', width: '90%', textAlign: 'center',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                    }}>
                        <div style={{
                            background: '#fef2f2', color: '#dc2626', width: '64px', height: '64px',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px', fontSize: '32px'
                        }}>
                            ❌
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', margin: 0 }}>
                            Invalid File Type
                        </h3>
                        <p style={{ color: '#4b5563', fontSize: '15px', marginBottom: '24px', marginTop: '12px', lineHeight: '1.5' }}>
                            {fileError}
                        </p>
                        <button
                            type="button"
                            onClick={() => setFileError('')}
                            style={{
                                background: '#dc2626', color: 'white', padding: '12px 24px',
                                borderRadius: '8px', border: 'none', cursor: 'pointer',
                                fontWeight: '600', width: '100%', fontSize: '15px', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#b91c1c'}
                            onMouseOut={(e) => e.target.style.background = '#dc2626'}
                        >
                            Okay
                        </button>
                    </div>
                </div>
            )
            }
        </div >
    );
}

