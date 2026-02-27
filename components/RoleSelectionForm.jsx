import { useState } from 'react';
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
];

export default function RoleSelectionForm({ selectedRole, onSelectRole }) {
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
                        onClick={() => onSelectRole(role.id)}
                    >
                        <span className={styles.roleIcon}>{role.icon}</span>
                        <span className={styles.roleLabel}>{role.label}</span>
                        <span className={styles.roleDescription}>{role.description}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
