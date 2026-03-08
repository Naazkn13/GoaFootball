import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/styles/Register.module.css';

const roles = [
    {
        id: 'athlete',
        label: 'Athlete',
        icon: '🏃',
        description: 'Register as a football player',
    },
    {
        id: 'coach',
        label: 'Coach',
        icon: '🏋️',
        description: 'Register as a football coach',
    },
    {
        id: 'referee',
        label: 'Referee',
        icon: '🏁',
        description: 'Register as a match referee',
    },
    {
        id: 'others',
        label: 'Others',
        icon: '📋',
        description: 'Parents, Physio, Support Staff, Etc',
    },
];

export default function RoleSelectionForm({ selectedRole, onSelectRole }) {
    const [showComingSoon, setShowComingSoon] = useState(false);

    return (
        <div className={styles.roleSection}>
            <h3 className={styles.stepTitle}>Select Your Role</h3>
            <p className={styles.stepDescription}>Choose the role that best describes you</p>

            <div className={styles.roleGrid}>
                {roles.map((role) => (
                    <button
                        key={role.id}
                        type="button"
                        className={`${styles.roleCard} ${selectedRole === role.id ? styles.roleSelected : ''}`}
                        onClick={() => {
                            if (role.id === 'others') {
                                setShowComingSoon(true);
                            } else {
                                onSelectRole(role.id);
                            }
                        }}
                    >
                        <span className={styles.roleIcon}>{role.icon}</span>
                        <span className={styles.roleLabel}>{role.label}</span>
                        <span className={styles.roleDescription}>{role.description}</span>
                    </button>
                ))}
            </div>

            {/* Custom Modal for Implementation in Progress */}
            {showComingSoon && typeof document !== 'undefined' && createPortal(
                <div className={styles.customModalOverlay} onClick={() => setShowComingSoon(false)}>
                    <div className={styles.customModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.customModalIcon}>🚧</div>
                        <h4 className={styles.customModalTitle}>Implementation in Progress</h4>
                        <p className={styles.customModalText}>
                            The registration flow for Others (Parents, Physios, etc) is currently being developed and will be available soon.
                        </p>
                        <button className={styles.customModalBtn} onClick={() => setShowComingSoon(false)}>
                            Got it, thanks!
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
