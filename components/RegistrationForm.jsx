import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
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
    others: [
        { name: 'specific_role', label: 'Specific Role', type: 'select', options: ['Club Manager', 'Physiotherapist', 'Medical Staff', 'Parent', 'Fan/Supporter', 'General Support Staff'], required: true },
    ],
};

export default function RegistrationForm({ role, formData, onChange, errors, prefilledClubId, prefilledClubName, isClubRegistration, formStep }) {
    const roleFields = ROLE_FIELDS[role] || [];
    const [clubs, setClubs] = useState([]);
    const [fileError, setFileError] = useState('');
    const [showTCModal, setShowTCModal] = useState(false);
    const addressSameAsProof = formData.address_same_as_proof || false;

    const isAthlete = role === 'athlete' || role === 'player';
    let age = 100;
    if (formData.date_of_birth) {
        age = (new Date() - new Date(formData.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000);
    }
    const requireConsent = isAthlete && age < 18;

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

    // Datepicker handler mapping
    const dobValue = formData.date_of_birth ? new Date(formData.date_of_birth) : null;
    const handleDatePickerChange = (date) => {
        if (!date) {
            handleChange('date_of_birth', '');
            return;
        }
        if (isNaN(date.getTime())) return;
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        handleChange('date_of_birth', `${year}-${month}-${day}`);
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
                {/* Select Club */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label htmlFor="reg-club">Select Club {role !== 'others' ? '*' : '(Optional)'}</label>
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
                            required={role !== 'others'}
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
                        <DatePicker
                            selected={dobValue}
                            onChange={handleDatePickerChange}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="DD/MM/YYYY"
                            maxDate={new Date()}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            required
                            wrapperClassName={styles.fullWidth}
                            className={styles.fileInput} // Resusing fileInput for padding/border look
                            customInput={
                                <input 
                                    readOnly={true}
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px', 
                                        border: '2px solid #e5e7eb', 
                                        borderRadius: '8px', 
                                        fontSize: '1rem',
                                        color: '#1f2937',
                                        fontFamily: 'inherit',
                                        backgroundColor: '#ffffff',
                                        cursor: 'pointer'
                                    }} 
                                />
                            }
                        />
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
                    <label htmlFor="reg-idproof">Aadhaar/Passport * (PDF/JPEG/PNG, max 5MB)</label>
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

                {requireConsent && (
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
                )}
            </div>

            </>
            )}

            {formStep === 3 && (
                <>
                    <h3 className={styles.stepTitle} style={{ marginTop: '0' }}>Address</h3>

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

                    {!requireConsent && (
                        <div className={styles.tcContainer} style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: '#0f172a', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={formData.accepted_tc || false}
                                    onChange={(e) => handleChange('accepted_tc', e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span>I have read and agree to the <a href="#" onClick={(e) => { e.preventDefault(); setShowTCModal(true); }} style={{ color: '#2563eb', textDecoration: 'underline' }}>Terms and Conditions</a></span>
                            </label>
                            {errors?.accepted_tc && <span className={styles.fieldError} style={{ display: 'block', marginTop: '8px' }}>{errors.accepted_tc}</span>}
                        </div>
                    )}
                </>
            )}

            {/* Terms and Conditions Modal */}
            {showTCModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem'
                }}>
                    <div style={{
                        background: 'white', padding: '2.5rem', borderRadius: '20px',
                        maxWidth: '800px', width: '100%', maxHeight: '75vh', display: 'flex', flexDirection: 'column',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                    }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#111827', marginBottom: '20px', margin: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                            Terms and Conditions
                        </h3>
                        <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', marginBottom: '24px', overflowY: 'auto', paddingRight: '10px', flex: 1 }}>
                            <ul style={{ paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <li>I hereby confirm my participation in the 14th Goa Football Festival (GFF) organized by National Sports Academy.</li>
                                <li>I hereby authorize the staff of Goa Football Festival to act for me according to their best judgment in any emergency requiring medical attention.</li>
                                <li>I hereby waive and release Goa Football Festival and its staff from any and all liabilities for any accident or injuries incurred while the tournament, travelling or sightseeing from the venue.</li>
                                <li>All medical expenses incurred will be the responsibility of the participant or the participant's family/guardian.</li>
                                <li>Goa Football Festival is not responsible for the lost, stolen or damage of any personal belonging of participants.</li>
                                <li>I acknowledge and agree to assume and be fully responsible for any and all property or other damage to the facilities used at the venue.</li>
                                <li>Misbehaviour or indiscipline will not be tolerated and the participant will be asked to leave the tournament as well as the venue.</li>
                                <li>The GFF Team has a Zero-Tolerance Policy towards alcohol, tobacco, and any other harmful substances. If any such substances are used or found in the possession of any athlete, the athlete will be Banned & will not be allowed to participate in any competitions.</li>
                                <li>I understand Goa Football Festival retains the rights to use any photographs, videotapes, motion picture recording or any other record of the event for publicity, advertising or any legitimate purpose.</li>
                            </ul>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                            <button
                                type="button"
                                onClick={() => setShowTCModal(false)}
                                style={{
                                    background: '#2563eb', color: 'white', padding: '12px 30px',
                                    borderRadius: '10px', border: 'none', cursor: 'pointer',
                                    fontWeight: '600', fontSize: '15px', transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
                                onMouseOut={(e) => e.target.style.background = '#2563eb'}
                            >
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
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

