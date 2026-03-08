import styles from '@/styles/Profile.module.css';

const STATUS_CONFIG = {
    pending: {
        icon: '⏳',
        label: 'UID Approval Under Process',
        className: 'badgePending',
        color: '#f59e0b',
    },
    approved: {
        icon: '✅',
        label: 'Active',
        className: 'badgeApproved',
        color: '#22c55e',
    },
    rejected: {
        icon: '❌',
        label: 'UID Rejected',
        className: 'badgeRejected',
        color: '#ef4444',
    },
    on_hold: {
        icon: '⏸️',
        label: 'UID On Hold',
        className: 'badgeOnHold',
        color: '#f97316',
    },
};

export default function ApprovalBadge({ status, reason, footballId }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    return (
        <div className={styles.approvalSection}>
            <div className={`${styles.approvalBadge} ${styles[config.className]}`}>
                <span className={styles.badgeIcon}>{config.icon}</span>
                <div className={styles.badgeInfo}>
                    <span className={styles.badgeLabel}>{config.label}</span>
                    {status === 'approved' && footballId && (
                        <span className={styles.footballIdBadge}>Active ID: <span style={{ letterSpacing: '0.5px' }}>{footballId}</span></span>
                    )}
                    {reason && (status === 'rejected' || status === 'on_hold') && (
                        <span className={styles.badgeReason}>Reason: {reason}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
