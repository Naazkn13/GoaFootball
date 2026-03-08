import { useState, useEffect } from 'react';
import axiosInstance from '@/services/axios';
import styles from '@/styles/PageDesigner.module.css';

// Default content for each section (matches current hardcoded values)
const DEFAULTS = {
    home: {
        hero: {
            badge_text: 'Registrations Open for 2026',
            title: 'Your Football\nJourney Starts Here',
            subtitle: 'Register as a Player, Coach, Referee, or Manager. Get your unique Football UID and become part of the community.',
            primary_btn: 'Register Now',
            secondary_btn: 'Learn More ↓',
            images: [],
        },
        gallery: {
            title: 'Our Gallery',
            subtitle: 'Moments from the Goa Football Festival',
            images: [],
        },
        stats: {
            items: [
                { value: 1200, label: 'Registered Players' },
                { value: 50, label: 'Certified Coaches' },
                { value: 25, label: 'Active Referees' },
                { value: 8, label: 'Events Organized' },
            ],
        },
        roles: {
            title: 'Choose Your Role',
            subtitle: 'Every role matters in football. Find yours and join the community.',
            items: [
                { icon: '🏃', title: 'Athlete', desc: 'Register as a football player and showcase your skills', color: '#3b82f6' },
                { icon: '🏋️', title: 'Coach', desc: 'Guide and mentor the next generation of footballers', color: '#22c55e' },
                { icon: '🏁', title: 'Referee', desc: 'Ensure fair play and uphold the spirit of the game', color: '#f59e0b' },
                { icon: '📋', title: 'Manager', desc: 'Lead teams and manage operations behind the scenes', color: '#a855f7' },
            ],
        },
        how_it_works: {
            title: 'How It Works',
            subtitle: 'Get registered in 3 simple steps',
            steps: [
                { title: 'Enter Your Email', desc: 'Provide your email to receive a one-time login code. No passwords needed.' },
                { title: 'Complete Registration', desc: 'Select your role, fill in your details, and upload required documents.' },
                { title: 'Get Your Football UID', desc: 'After payment and admin approval, receive your unique Football ID.' },
            ],
        },
        about: {
            title: 'About the Platform',
            paragraph1: 'Our Football Registration platform provides a seamless, secure way for players, coaches, referees, and managers to register for football events and obtain their unique Football UID.',
            paragraph2: 'Built with security at its core — email OTP authentication, secure document handling, and admin-verified approval ensures only legitimate registrations are processed.',
            features: ['Secure email OTP login', 'Role-based registration', 'Document verification', 'Admin approval system', 'Real-time chat support', 'Secure payment processing'],
        },
        cta: {
            title: 'Ready to Join the Game?',
            subtitle: 'Register today and get your unique Football UID',
            button: 'Register Now ⚽',
        },
    },
    about: {
        main: {
            page_title: 'About Goa Football Festival',
            page_subtitle: 'Your Premier Football Registration Platform',
            sections: [
                { heading: 'Who We Are', content: 'Welcome to Goa Football Festival — Goa\'s leading football registration platform. We are passionate about making sports accessible, convenient, and enjoyable for everyone.' },
                { heading: 'Our Mission', content: 'Our mission is to promote active lifestyles and foster a vibrant sports community by providing easy registration, quality events, and community building.' },
                { heading: 'Our Vision', content: 'We envision a future where every football enthusiast in Goa can register, participate, and grow in the sport they love.' },
            ],
        },
    },
    footer: {
        contact: {
            email: 'contactus.sksports@gmail.com',
            phone: '+91 9326 394341',
            company_name: 'Goa Football Festival',
        },
    },
};

const SECTION_LABELS = {
    hero: '🏠 Hero Banner',
    stats: '📊 Stats Counter',
    roles: '🎭 Role Cards',
    how_it_works: '📝 How It Works',
    about: '📖 About Section',
    cta: '📢 CTA Banner',
    gallery: '🖼️ Image Gallery',
    main: '📄 About Page Content',
    contact: '📞 Footer Contact Info',
};

export default function PageDesigner() {
    const [activePage, setActivePage] = useState('home');
    const [sections, setSections] = useState({});
    const [editingSection, setEditingSection] = useState(null);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Image upload handler
    const handleImageUpload = async (file, section, onSuccess) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('section', section);
            const res = await axiosInstance.post('/api/admin/upload-site-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                onSuccess(res.data.url);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Image upload failed: ' + (err.response?.data?.message || err.message) });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } finally {
            setUploading(false);
        }
    };

    // Fetch content for active page
    useEffect(() => {
        fetchContent();
    }, [activePage]);

    const fetchContent = async () => {
        try {
            const res = await axiosInstance.get(`/api/admin/site-content?page=${activePage}`);
            const loaded = {};
            (res.data.sections || []).forEach(s => {
                loaded[s.section] = s.content;
            });
            setSections(loaded);
        } catch {
            setSections({});
        }
    };

    const getContent = (section) => {
        return sections[section] || DEFAULTS[activePage]?.[section] || {};
    };

    const startEditing = (section) => {
        setEditingSection(section);
        setEditData(JSON.parse(JSON.stringify(getContent(section))));
        setMessage({ type: '', text: '' });
    };

    const saveSection = async () => {
        setSaving(true);
        try {
            await axiosInstance.put('/api/admin/site-content', {
                page: activePage,
                section: editingSection,
                content: editData,
            });
            setSections(prev => ({ ...prev, [editingSection]: editData }));
            setMessage({ type: 'success', text: 'Section saved successfully!' });
            setEditingSection(null);
            setEditData(null);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const cancelEditing = () => {
        setEditingSection(null);
        setEditData(null);
    };

    // Get sections for current page
    const pageSections = Object.keys(DEFAULTS[activePage] || {});

    return (
        <div className={styles.designer}>
            {/* Page Tabs */}
            <div className={styles.pageTabs}>
                {['home', 'about', 'footer'].map(page => (
                    <button
                        key={page}
                        className={`${styles.pageTab} ${activePage === page ? styles.pageTabActive : ''}`}
                        onClick={() => { setActivePage(page); setEditingSection(null); }}
                    >
                        {page === 'home' ? '🏠 Home Page' : page === 'about' ? '📄 About Page' : '🔗 Footer'}
                    </button>
                ))}
            </div>

            {/* Messages */}
            {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
            )}

            {/* Section Cards */}
            <div className={styles.sectionsList}>
                {pageSections.map(section => {
                    const content = getContent(section);
                    const isEditing = editingSection === section;

                    return (
                        <div key={section} className={`${styles.sectionCard} ${isEditing ? styles.sectionCardEditing : ''}`}>
                            <div className={styles.sectionCardHeader}>
                                <h3>{SECTION_LABELS[section] || section}</h3>
                                {!isEditing && (
                                    <button className={styles.editBtn} onClick={() => startEditing(section)}>
                                        ✏️ Edit
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className={styles.editForm}>
                                    {renderSectionEditor(activePage, section, editData, setEditData, handleImageUpload, uploading)}
                                    <div className={styles.editActions}>
                                        <button className={styles.saveBtn} onClick={saveSection} disabled={saving || uploading}>
                                            {saving ? 'Saving...' : '💾 Save'}
                                        </button>
                                        <button className={styles.cancelBtn} onClick={cancelEditing}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.sectionPreview}>
                                    {renderSectionPreview(activePage, section, content)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ===== Section Editor Renderers =====
function renderSectionEditor(page, section, data, setData, handleImageUpload, uploading) {
    const update = (key, val) => setData(prev => ({ ...prev, [key]: val }));
    const updateNested = (key, index, field, val) => {
        setData(prev => {
            const arr = [...(prev[key] || [])];
            arr[index] = { ...arr[index], [field]: val };
            return { ...prev, [key]: arr };
        });
    };

    // Helper for image sections
    const renderImageGrid = (images, sectionName) => {
        const imgList = images || [];
        const maxImages = 5;
        const removeImage = (index) => update('images', imgList.filter((_, i) => i !== index));
        return (
            <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '0.85rem', color: '#555', fontWeight: '600', marginBottom: '8px' }}>
                    📸 Images ({imgList.length}/{maxImages}) — Add caption below each image
                </p>
                {imgList.map((img, i) => (
                    <div key={`img-${sectionName}-${i}`} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px', padding: '10px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <img src={img.url} alt={img.caption || ''} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
                            <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.65rem', lineHeight: '20px' }}>✕</button>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#555', marginBottom: '4px' }}>Caption (optional)</label>
                            <input
                                placeholder="Enter caption for this image..."
                                value={img.caption || ''}
                                onChange={e => {
                                    const updated = [...imgList];
                                    updated[i] = { ...updated[i], caption: e.target.value };
                                    update('images', updated);
                                }}
                                style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                ))}
                {imgList.length < maxImages && (
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#eff6ff', border: '1px dashed #3b82f6', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#1d4ed8', marginTop: '4px' }}>
                        {uploading ? '⏳ Uploading...' : '+ Add Image'}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                            disabled={uploading}
                            onChange={e => {
                                if (e.target.files[0]) {
                                    handleImageUpload(e.target.files[0], sectionName, (url) => {
                                        update('images', [...imgList, { url, caption: '' }]);
                                    });
                                }
                                e.target.value = '';
                            }}
                        />
                    </label>
                )}
            </div>
        );
    };

    if (page === 'home' && section === 'hero') {
        return (
            <>
                <label>Badge Text<input value={data.badge_text || ''} onChange={e => update('badge_text', e.target.value)} /></label>
                <label>Title (use \n for line break)<textarea rows={2} value={data.title || ''} onChange={e => update('title', e.target.value)} /></label>
                <label>Subtitle<textarea rows={3} value={data.subtitle || ''} onChange={e => update('subtitle', e.target.value)} /></label>
                <label>Primary Button Text<input value={data.primary_btn || ''} onChange={e => update('primary_btn', e.target.value)} /></label>
                <label>Secondary Button Text<input value={data.secondary_btn || ''} onChange={e => update('secondary_btn', e.target.value)} /></label>
                {renderImageGrid(data.images, 'hero')}
            </>
        );
    }

    if (page === 'home' && section === 'gallery') {
        return (
            <>
                <label>Section Title<input value={data.title || ''} onChange={e => update('title', e.target.value)} /></label>
                <label>Section Subtitle<input value={data.subtitle || ''} onChange={e => update('subtitle', e.target.value)} /></label>
                {renderImageGrid(data.images, 'gallery')}
            </>
        );
    }

    if (page === 'home' && section === 'stats') {
        return (
            <>
                <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '10px' }}>Edit the 4 stat counters shown on the homepage.</p>
                {(data.items || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                        <label style={{ flex: 1 }}>Value<input type="number" value={item.value || 0} onChange={e => updateNested('items', i, 'value', parseInt(e.target.value) || 0)} /></label>
                        <label style={{ flex: 2 }}>Label<input value={item.label || ''} onChange={e => updateNested('items', i, 'label', e.target.value)} /></label>
                    </div>
                ))}
            </>
        );
    }

    if (page === 'home' && section === 'roles') {
        return (
            <>
                <label>Section Title<input value={data.title || ''} onChange={e => update('title', e.target.value)} /></label>
                <label>Section Subtitle<input value={data.subtitle || ''} onChange={e => update('subtitle', e.target.value)} /></label>
                <p style={{ fontSize: '0.85rem', color: '#888', margin: '10px 0 5px' }}>Role Cards:</p>
                {(data.items || []).map((item, i) => (
                    <div key={i} style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                            <label style={{ width: '60px' }}>Icon<input value={item.icon || ''} onChange={e => updateNested('items', i, 'icon', e.target.value)} /></label>
                            <label style={{ flex: 1 }}>Title<input value={item.title || ''} onChange={e => updateNested('items', i, 'title', e.target.value)} /></label>
                            <label style={{ width: '80px' }}>Color<input type="color" value={item.color || '#3b82f6'} onChange={e => updateNested('items', i, 'color', e.target.value)} /></label>
                        </div>
                        <label>Description<input value={item.desc || ''} onChange={e => updateNested('items', i, 'desc', e.target.value)} /></label>
                    </div>
                ))}
            </>
        );
    }

    if (page === 'home' && section === 'how_it_works') {
        return (
            <>
                <label>Section Title<input value={data.title || ''} onChange={e => update('title', e.target.value)} /></label>
                <label>Section Subtitle<input value={data.subtitle || ''} onChange={e => update('subtitle', e.target.value)} /></label>
                <p style={{ fontSize: '0.85rem', color: '#888', margin: '10px 0 5px' }}>Steps:</p>
                {(data.steps || []).map((step, i) => (
                    <div key={i} style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '10px' }}>
                        <label>Step {i + 1} Title<input value={step.title || ''} onChange={e => updateNested('steps', i, 'title', e.target.value)} /></label>
                        <label>Description<textarea rows={2} value={step.desc || ''} onChange={e => updateNested('steps', i, 'desc', e.target.value)} /></label>
                    </div>
                ))}
            </>
        );
    }

    if (page === 'home' && section === 'about') {
        return (
            <>
                <label>Section Title<input value={data.title || ''} onChange={e => update('title', e.target.value)} /></label>
                <label>Paragraph 1<textarea rows={3} value={data.paragraph1 || ''} onChange={e => update('paragraph1', e.target.value)} /></label>
                <label>Paragraph 2<textarea rows={3} value={data.paragraph2 || ''} onChange={e => update('paragraph2', e.target.value)} /></label>
                <p style={{ fontSize: '0.85rem', color: '#888', margin: '10px 0 5px' }}>Feature List (one per line):</p>
                <textarea
                    rows={6}
                    value={(data.features || []).join('\n')}
                    onChange={e => update('features', e.target.value.split('\n').filter(f => f.trim()))}
                />
            </>
        );
    }

    if (page === 'home' && section === 'cta') {
        return (
            <>
                <label>Title<input value={data.title || ''} onChange={e => update('title', e.target.value)} /></label>
                <label>Subtitle<input value={data.subtitle || ''} onChange={e => update('subtitle', e.target.value)} /></label>
                <label>Button Text<input value={data.button || ''} onChange={e => update('button', e.target.value)} /></label>
            </>
        );
    }

    if (page === 'about' && section === 'main') {
        const addSection = () => {
            setData(prev => ({
                ...prev,
                sections: [...(prev.sections || []), { heading: '', content: '' }],
            }));
        };
        const removeSection = (i) => {
            setData(prev => ({
                ...prev,
                sections: prev.sections.filter((_, idx) => idx !== i),
            }));
        };

        return (
            <>
                <label>Page Title<input value={data.page_title || ''} onChange={e => update('page_title', e.target.value)} /></label>
                <label>Page Subtitle<input value={data.page_subtitle || ''} onChange={e => update('page_subtitle', e.target.value)} /></label>
                <p style={{ fontSize: '0.85rem', color: '#888', margin: '10px 0 5px' }}>Content Sections:</p>
                {(data.sections || []).map((sec, i) => (
                    <div key={i} style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '10px', position: 'relative' }}>
                        <button onClick={() => removeSection(i)} style={{ position: 'absolute', top: '5px', right: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
                        <label>Heading<input value={sec.heading || ''} onChange={e => updateNested('sections', i, 'heading', e.target.value)} /></label>
                        <label>Content<textarea rows={4} value={sec.content || ''} onChange={e => updateNested('sections', i, 'content', e.target.value)} /></label>
                    </div>
                ))}
                <button onClick={addSection} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>+ Add Section</button>
            </>
        );
    }

    if (page === 'footer' && section === 'contact') {
        return (
            <>
                <label>Email<input type="email" value={data.email || ''} onChange={e => update('email', e.target.value)} /></label>
                <label>Phone<input value={data.phone || ''} onChange={e => update('phone', e.target.value)} /></label>
                <label>Company Name<input value={data.company_name || ''} onChange={e => update('company_name', e.target.value)} /></label>
            </>
        );
    }

    return <p>No editor available for this section.</p>;
}

// ===== Section Preview Renderers =====
function renderSectionPreview(page, section, content) {
    if (page === 'home' && section === 'hero') {
        return (
            <div>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', borderRadius: '12px', padding: '2px 8px', color: '#0369a1' }}>{content.badge_text}</span>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '6px 0 4px' }}>{(content.title || '').replaceAll('\n', ' ')}</p>
                <p style={{ color: '#666', fontSize: '0.85rem' }}>{content.subtitle}</p>
                {(content.images || []).length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                        {content.images.map((img, i) => (
                            <img key={img.url || i} src={img.url} alt="" style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (page === 'home' && section === 'gallery') {
        return (
            <div>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{content.title}</p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>{(content.images || []).length} images</p>
            </div>
        );
    }

    if (page === 'home' && section === 'stats') {
        return (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {(content.items || []).map((item, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                        <strong style={{ color: '#1a56db' }}>{item.value}+</strong><br />
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>{item.label}</span>
                    </div>
                ))}
            </div>
        );
    }

    if (page === 'home' && section === 'roles') {
        return (
            <div>
                <p style={{ fontWeight: '600', marginBottom: '6px' }}>{content.title}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(content.items || []).map((item, i) => (
                        <span key={i} style={{ backgroundColor: item.color + '22', color: item.color, padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' }}>{item.icon} {item.title}</span>
                    ))}
                </div>
            </div>
        );
    }

    if (page === 'home' && section === 'how_it_works') {
        return (
            <div>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{content.title}</p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>{(content.steps || []).map(s => s.title).join(' → ')}</p>
            </div>
        );
    }

    if (page === 'home' && section === 'about') {
        return (
            <div>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{content.title}</p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>{(content.paragraph1 || '').substring(0, 100)}...</p>
            </div>
        );
    }

    if (page === 'home' && section === 'cta') {
        return (
            <div>
                <p style={{ fontWeight: '600' }}>{content.title}</p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>{content.subtitle}</p>
            </div>
        );
    }

    if (page === 'about' && section === 'main') {
        return (
            <div>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{content.page_title}</p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>{content.page_subtitle}</p>
                <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>{(content.sections || []).length} sections</p>
            </div>
        );
    }

    if (page === 'footer' && section === 'contact') {
        return (
            <div style={{ fontSize: '0.85rem' }}>
                <p><strong>Email:</strong> {content.email}</p>
                <p><strong>Phone:</strong> {content.phone}</p>
                <p><strong>Company:</strong> {content.company_name}</p>
            </div>
        );
    }

    return <p style={{ color: '#999' }}>No preview available</p>;
}
