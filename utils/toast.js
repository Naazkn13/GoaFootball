import toast from 'react-hot-toast';

/**
 * Standardized success toast
 */
export const toastSuccess = (message) => {
    toast.success(message, {
        duration: 3000,
        position: 'top-center',
        style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '600',
        },
    });
};

/**
 * Standardized error toast
 */
export const toastError = (message) => {
    toast.error(message, {
        duration: 4000,
        position: 'top-center',
        style: {
            background: '#dc2626',
            color: '#fff',
            fontWeight: '600',
        },
    });
};

/**
 * Standardized warning toast
 */
export const toastWarning = (message) => {
    toast(message, {
        duration: 4000,
        position: 'top-center',
        icon: '⚠️',
        style: {
            background: '#f59e0b',
            color: '#fff',
            fontWeight: '600',
        },
    });
};

/**
 * Custom Promise-based Confirmation Toast
 * Replaces native window.confirm() with a sleek UI popup
 * 
 * @param {string} title - The main warning message
 * @param {string} [subtitle] - Optional subtitle or explanation text
 * @returns {Promise<boolean>} Resolves to true if OK clicked, false if Cancel clicked
 */
export const confirmAction = (title, subtitle = '') => {
    return new Promise((resolve) => {
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
                <div>
                    <strong style={{ fontSize: '1rem', color: '#111827', display: 'block', marginBottom: '4px' }}>
                        ⚠️ {title}
                    </strong>
                    {subtitle && (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.4' }}>
                            {subtitle}
                        </p>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            resolve(false);
                        }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            background: '#f9fafb',
                            color: '#374151',
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            resolve(true);
                        }}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#dc2626',
                            color: '#fff',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        OK
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity, // don't auto-dismiss confirmations
            position: 'top-center',
            style: {
                background: '#fff',
                border: '1px solid #fca5a5',
                padding: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }
        });
    });
};
