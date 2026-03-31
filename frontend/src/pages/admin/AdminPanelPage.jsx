import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import * as adminApi from '../../api/admin';
import { logout } from '../../api/auth';

const fmt = (n) => '৳' + Number(n).toLocaleString();
const fmtDate = (d) => new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    unpaid: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    refunded: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-800',
    draft: 'bg-amber-100 text-amber-800',
    archived: 'bg-gray-100 text-gray-500',
    suspended: 'bg-red-100 text-red-800',
    deleted: 'bg-gray-100 text-gray-500',
    admin: 'bg-purple-100 text-purple-800',
    customer: 'bg-gray-100 text-gray-700',
    seller: 'bg-blue-100 text-blue-800',
};

const Badge = ({ text }) => (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[text] || 'bg-gray-100 text-gray-700'}`}>
        {text}
    </span>
);

const Toast = ({ msg, onClose }) => (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <span>{msg}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
    </div>
);

// ── Dashboard ─────────────────────────────────────────────────────
const Dashboard = ({ stats }) => (
    <div>
        <h2 className="text-2xl font-heading text-primary mb-1">Dashboard</h2>
        <p className="text-sm text-gray-500 mb-6">BanglaCraft Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
                { label: 'Total Users', value: stats.total_users || 0 },
                { label: 'Total Orders', value: stats.total_orders || 0 },
                { label: 'Pending', value: stats.pending_orders || 0, highlight: true },
                { label: 'Revenue', value: fmt(stats.total_revenue || 0), green: true },
            ].map((s) => (
                <div key={s.label} className="bg-white border border-border rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.highlight ? 'text-primary' : s.green ? 'text-green-700' : 'text-gray-800'}`}>
                        {s.value}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

// ── Users ─────────────────────────────────────────────────────────
const Users = ({ toast }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'customer' });

    useEffect(() => {
        adminApi.getUsers().then(r => setUsers(r.data)).finally(() => setLoading(false));
    }, []);

    const handleStatus = async (id, status) => {
        try {
            await adminApi.updateUserStatus(id, status);
            setUsers(u => u.map(x => x.id === id ? { ...x, status } : x));
            toast(status === 'suspended' ? 'User suspended' : 'User activated');
        } catch (e) { toast(e.response?.data?.detail || 'Error'); }
    };

    const handleRole = async (id, role) => {
        try {
            await adminApi.updateUserRole(id, role);
            setUsers(u => u.map(x => x.id === id ? { ...x, role } : x));
            toast('Role updated to ' + role);
        } catch (e) { toast(e.response?.data?.detail || 'Error'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this user?')) return;
        try {
            await adminApi.deleteUser(id);
            setUsers(u => u.map(x => x.id === id ? { ...x, status: 'deleted' } : x));
            toast('User deleted');
        } catch (e) { toast(e.response?.data?.detail || 'Error'); }
    };

    const handleAdd = async () => {
        if (!form.full_name || !form.email || !form.password) return toast('All fields required');
        try {
            const r = await adminApi.createUser(form);
            setUsers(u => [...u, r.data]);
            setShowAdd(false);
            setForm({ full_name: '', email: '', password: '', role: 'customer' });
            toast('User added');
        } catch (e) { toast(e.response?.data?.detail || 'Error adding user'); }
    };

    if (loading) return <p className="text-gray-400">Loading...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-heading text-primary">Users</h2>
                    <p className="text-sm text-gray-500">{users.length} total</p>
                </div>
                <button onClick={() => setShowAdd(true)}
                    className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary/90">
                    + Add User
                </button>
            </div>

            {showAdd && (
                <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary">Add New User</h3>
                            <button onClick={() => setShowAdd(false)} className="text-gray-400 text-xl">✕</button>
                        </div>
                        {[
                            { label: 'Full Name', key: 'full_name', type: 'text' },
                            { label: 'Email', key: 'email', type: 'email' },
                            { label: 'Password', key: 'password', type: 'password' },
                        ].map(f => (
                            <div key={f.key} className="mb-3">
                                <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                                <input type={f.type} value={form[f.key]}
                                    onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                                    className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                            </div>
                        ))}
                        <div className="mb-4">
                            <label className="text-xs text-gray-500 block mb-1">Role</label>
                            <select value={form.role} onChange={e => setForm(x => ({ ...x, role: e.target.value }))}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm">
                                <option value="customer">Customer</option>
                                <option value="seller">Seller</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button onClick={handleAdd}
                            className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium">
                            Add User
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-border">
                            <tr>
                                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium">{u.full_name}</td>
                                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                    <td className="px-4 py-3"><Badge text={u.role} /></td>
                                    <td className="px-4 py-3"><Badge text={u.status} /></td>
                                    <td className="px-4 py-3 text-gray-400">{u.created_at ? fmtDate(u.created_at) : '-'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 flex-wrap">
                                            {u.status === 'active'
                                                ? <button onClick={() => handleStatus(u.id, 'suspended')} className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded-lg hover:bg-red-50">Suspend</button>
                                                : u.status === 'suspended'
                                                    ? <button onClick={() => handleStatus(u.id, 'active')} className="text-xs border border-green-200 text-green-700 px-2 py-1 rounded-lg hover:bg-green-50">Activate</button>
                                                    : null
                                            }
                                            {u.role !== 'admin'
                                                ? <button onClick={() => handleRole(u.id, 'admin')} className="text-xs border border-purple-200 text-purple-700 px-2 py-1 rounded-lg hover:bg-purple-50">→ Admin</button>
                                                : <button onClick={() => handleRole(u.id, 'customer')} className="text-xs border border-gray-200 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50">→ Customer</button>
                                            }
                                            {u.status !== 'deleted' &&
                                                <button onClick={() => handleDelete(u.id)} className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded-lg hover:bg-red-50">Delete</button>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ── Orders ────────────────────────────────────────────────────────
const Orders = ({ toast }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [memoOrder, setMemoOrder] = useState(null);
    const [memoText, setMemoText] = useState('');
    const [printOrder, setPrintOrder] = useState(null);

    useEffect(() => {
        adminApi.getOrders().then(r => setOrders(r.data)).finally(() => setLoading(false));
    }, []);

    const handleStatus = async (id, status) => {
        try {
            await adminApi.updateOrderStatus(id, status);
            setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
            toast('Order status updated');
        } catch (e) { toast(e.response?.data?.detail || 'Error'); }
    };

    const handlePayStatus = async (id, payment_status) => {
        try {
            await adminApi.updatePaymentStatus(id, payment_status);
            setOrders(o => o.map(x => x.id === id ? { ...x, payment_status } : x));
            toast('Payment status updated');
        } catch (e) { toast(e.response?.data?.detail || 'Error'); }
    };

    const handleSaveMemo = async () => {
        try {
            await adminApi.updateOrderNotes(memoOrder.id, memoText);
            setOrders(o => o.map(x => x.id === memoOrder.id ? { ...x, notes: memoText } : x));
            setMemoOrder(null);
            toast('Notes saved');
        } catch (e) { toast(e.response?.data?.detail || 'Error'); }
    };

    const handlePrint = (order) => {
        setPrintOrder(order);
        setTimeout(() => {
            const content = document.getElementById('print-area')?.innerHTML;
            if (!content) return;
            const w = window.open('', '_blank');
            w.document.write(`<html><head><title>BanglaCraft Order</title>
            <style>body{font-family:Georgia,serif;padding:30px;max-width:500px;margin:0 auto}
            h2{color:#C5703A;text-align:center}.sub{text-align:center;font-size:12px;color:#888;margin-bottom:12px}
            .row{display:flex;justify-content:space-between;font-size:13px;padding:4px 0;border-bottom:1px solid #eee}
            .total{display:flex;justify-content:space-between;font-weight:700;font-size:15px;color:#C5703A;padding:8px 0}
            @media print{button{display:none}}</style></head>
            <body>${content}</body></html>`);
            w.document.close();
            w.focus();
            setTimeout(() => w.print(), 300);
        }, 100);
    };

    if (loading) return <p className="text-gray-400">Loading...</p>;

    return (
        <div>
            <h2 className="text-2xl font-heading text-primary mb-1">Orders</h2>
            <p className="text-sm text-gray-500 mb-6">Manage all customer orders</p>

            {selected && (
                <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary">Order Detail</h3>
                            <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">✕</button>
                        </div>
                        <div className="text-sm space-y-1 mb-4">
                            <p><strong>Customer:</strong> {selected.customer_name}</p>
                            <p><strong>Email:</strong> {selected.customer_email}</p>
                            <p><strong>Address:</strong> {JSON.stringify(selected.shipping_address)}</p>
                            <p><strong>Payment:</strong> {selected.payment_method?.toUpperCase()} — <Badge text={selected.payment_status} /></p>
                            {selected.payment_transaction_id && <p><strong>TXN ID:</strong> {selected.payment_transaction_id}</p>}
                            <p><strong>Date:</strong> {fmtDate(selected.created_at)}</p>
                            {selected.notes && <p><strong>Notes:</strong> {selected.notes}</p>}
                        </div>
                        <table className="w-full text-sm mb-3">
                            <thead><tr className="border-b"><th className="text-left py-1">Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                            <tbody>
                                {selected.items?.map((i, idx) => (
                                    <tr key={idx} className="border-b border-gray-50">
                                        <td className="py-1">{i.product_snapshot?.name}</td>
                                        <td className="text-center">{i.quantity}</td>
                                        <td className="text-right">{fmt(i.unit_price)}</td>
                                        <td className="text-right">{fmt(i.total_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="text-right font-bold text-primary">{fmt(selected.total_amount)}</div>
                        <button onClick={() => handlePrint(selected)}
                            className="mt-4 w-full bg-primary text-white py-2 rounded-lg text-sm">
                            Print Memo
                        </button>
                    </div>
                </div>
            )}

            {memoOrder && (
                <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary">Notes</h3>
                            <button onClick={() => setMemoOrder(null)} className="text-gray-400 text-xl">✕</button>
                        </div>
                        <textarea rows={5} value={memoText}
                            onChange={e => setMemoText(e.target.value)}
                            placeholder="e.g. Delivered to gate. Signed by Rahim."
                            className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none mb-3" />
                        <button onClick={handleSaveMemo}
                            className="w-full bg-primary text-white py-2 rounded-lg text-sm">
                            Save Notes
                        </button>
                    </div>
                </div>
            )}

            {printOrder && (
                <div id="print-area" style={{ display: 'none' }}>
                    <h2>BanglaCraft</h2>
                    <div className="sub">Crafted with Heart, Rooted in Bangladesh<br />support@banglacraft.com</div>
                    <hr />
                    <div className="row"><span><b>Order ID:</b></span><span>{printOrder.id}</span></div>
                    <div className="row"><span><b>Customer:</b></span><span>{printOrder.customer_name}</span></div>
                    <div className="row"><span><b>Payment:</b></span><span>{printOrder.payment_method?.toUpperCase()}</span></div>
                    <div className="row"><span><b>Date:</b></span><span>{fmtDate(printOrder.created_at)}</span></div>
                    <br />
                    {printOrder.items?.map((i, idx) => (
                        <div key={idx} className="row">
                            <span>{i.product_snapshot?.name} × {i.quantity}</span>
                            <span>{fmt(i.total_price)}</span>
                        </div>
                    ))}
                    <div className="total"><span>Total</span><span>{fmt(printOrder.total_amount)}</span></div>
                    {printOrder.notes && <p style={{ marginTop: 12, fontSize: 12 }}><b>Notes:</b> {printOrder.notes}</p>}
                    <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#888' }}>Thank you for shopping with BanglaCraft!</p>
                </div>
            )}

            <div className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-border">
                            <tr>
                                {['Order ID', 'Customer', 'Total', 'Payment', 'Pay Status', 'Order Status', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-10 text-gray-400">No orders yet</td></tr>
                            ) : orders.map(o => (
                                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-mono text-xs text-primary">{o.id.slice(0, 8)}...</td>
                                    <td className="px-4 py-3 font-medium">{o.customer_name}</td>
                                    <td className="px-4 py-3 font-medium">{fmt(o.total_amount)}</td>
                                    <td className="px-4 py-3 uppercase text-xs">{o.payment_method}</td>
                                    <td className="px-4 py-3">
                                        <select value={o.payment_status}
                                            onChange={e => handlePayStatus(o.id, e.target.value)}
                                            className="text-xs border border-border rounded-lg px-2 py-1">
                                            {['unpaid', 'paid', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <select value={o.status}
                                            onChange={e => handleStatus(o.id, e.target.value)}
                                            className="text-xs border border-border rounded-lg px-2 py-1">
                                            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s =>
                                                <option key={s} value={s}>{s}</option>
                                            )}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(o.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => setSelected(o)}
                                                className="text-xs border border-border px-2 py-1 rounded-lg hover:bg-gray-50">Detail</button>
                                            <button onClick={() => { setMemoOrder(o); setMemoText(o.notes || ''); }}
                                                className="text-xs border border-border px-2 py-1 rounded-lg hover:bg-gray-50">Notes</button>
                                            <button onClick={() => handlePrint(o)}
                                                className="text-xs border border-green-200 text-green-700 px-2 py-1 rounded-lg hover:bg-green-50">Print</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ── Products ──────────────────────────────────────────────────────
const Products = ({ toast }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [form, setForm] = useState({
        name_en: '', name_bn: '', price: '', sale_price: '',
        description_en: '', description_bn: '',
        stock_quantity: '', category_id: '', tags: '', status: 'active'
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        Promise.all([
            adminApi.getAdminProducts(),
            adminApi.getCategories(),
        ]).then(([p, c]) => {
            setProducts(p.data);
            setCategories(c.data);
        }).finally(() => setLoading(false));
    }, []);

    const resetForm = () => {
        setForm({
            name_en: '', name_bn: '', price: '', sale_price: '',
            description_en: '', description_bn: '',
            stock_quantity: '', category_id: '', tags: '', status: 'active'
        });
        setImageFiles([]);
        setImagePreviews([]);
        setEditProduct(null);
        setShowForm(false);
    };

    const openEdit = (p) => {
        setEditProduct(p);
        setForm({
            name_en: p.name_en,
            name_bn: p.name_bn,
            price: p.price,
            sale_price: p.sale_price || '',
            description_en: p.description_en || '',
            description_bn: p.description_bn || '',
            stock_quantity: p.stock_quantity,
            category_id: p.category_id,
            tags: (p.tags || []).join(', '),
            status: p.status,
        });
        setImagePreviews(p.images || []);
        setImageFiles([]);
        setShowForm(true);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setImageFiles(prev => [...prev, ...files]);
        const previews = files.map(f => URL.createObjectURL(f));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!form.name_en || !form.price || !form.category_id) {
            return toast('Name, price and category are required');
        }
        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (v !== '' && v !== null && v !== undefined) fd.append(k, v);
            });
            imageFiles.forEach(file => fd.append('images', file));

            if (editProduct) {
                await adminApi.updateProduct(editProduct.id, fd);
                toast('Product updated');
            } else {
                await adminApi.createProduct(fd);
                toast('Product created');
            }
            const r = await adminApi.getAdminProducts();
            setProducts(r.data);
            resetForm();
        } catch (e) {
            toast(e.response?.data?.detail || 'Error saving product');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            await adminApi.deleteProduct(id);
            setProducts(p => p.filter(x => x.id !== id));
            toast('Product deleted');
        } catch (e) { toast(e.response?.data?.detail || 'Error'); }
    };

    const handleApprove = async (id) => {
        try {
            await adminApi.approveProduct(id);
            setProducts(p => p.map(x => x.id === id ? { ...x, is_approved: true, status: 'active' } : x));
            toast('Product approved');
        } catch (e) { toast(e.response?.data?.detail || 'Error'); }
    };

    if (loading) return <p className="text-gray-400">Loading...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-heading text-primary">Products</h2>
                    <p className="text-sm text-gray-500">{products.length} total</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary/90">
                    + Add Product
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary">
                                {editProduct ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <button onClick={resetForm} className="text-gray-400 text-xl">✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Name (English)', key: 'name_en' },
                                { label: 'Name (বাংলা)', key: 'name_bn' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                                    <input value={form[f.key]}
                                        onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                                        className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                                </div>
                            ))}
                            {[
                                { label: 'Price (৳)', key: 'price', type: 'number' },
                                { label: 'Sale Price (৳)', key: 'sale_price', type: 'number' },
                                { label: 'Stock Quantity', key: 'stock_quantity', type: 'number' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                                    <input type={f.type} value={form[f.key]}
                                        onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                                        className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                                </div>
                            ))}
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Category</label>
                                <select value={form.category_id}
                                    onChange={e => setForm(x => ({ ...x, category_id: e.target.value }))}
                                    className="w-full border border-border rounded-lg px-3 py-2 text-sm">
                                    <option value="">Select category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name_en}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Status</label>
                                <select value={form.status}
                                    onChange={e => setForm(x => ({ ...x, status: e.target.value }))}
                                    className="w-full border border-border rounded-lg px-3 py-2 text-sm">
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="text-xs text-gray-500 block mb-1">Description (English)</label>
                            <textarea rows={3} value={form.description_en}
                                onChange={e => setForm(x => ({ ...x, description_en: e.target.value }))}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none" />
                        </div>
                        <div className="mt-3">
                            <label className="text-xs text-gray-500 block mb-1">Description (বাংলা)</label>
                            <textarea rows={3} value={form.description_bn}
                                onChange={e => setForm(x => ({ ...x, description_bn: e.target.value }))}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none" />
                        </div>
                        <div className="mt-3">
                            <label className="text-xs text-gray-500 block mb-1">Tags (comma separated)</label>
                            <input value={form.tags}
                                onChange={e => setForm(x => ({ ...x, tags: e.target.value }))}
                                placeholder="e.g. handmade, cotton, traditional"
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                        </div>

                        {/* ── Multiple Image Upload ── */}
                        <div className="mt-3">
                            <label className="text-xs text-gray-500 block mb-1">
                                Product Images <span className="text-gray-400">(একাধিক ছবি দিতে পারবে)</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {imagePreviews.map((src, i) => (
                                    <div key={i} className="relative">
                                        <img src={src} alt={`preview-${i}`}
                                            className="w-16 h-16 object-cover rounded-lg border border-border" />
                                        <button
                                            onClick={() => removeImage(i)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center hover:bg-red-600">
                                            ✕
                                        </button>
                                        {i === 0 && (
                                            <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center rounded-b-lg">
                                                Main
                                            </span>
                                        )}
                                    </div>
                                ))}
                                <label className="cursor-pointer border-2 border-dashed border-border rounded-lg w-16 h-16 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors">
                                    <span className="text-2xl leading-none">+</span>
                                    <span className="text-[10px]">Add</span>
                                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>
                            <p className="text-xs text-gray-400">প্রথম ছবিটি Main Image হিসেবে দেখাবে</p>
                        </div>

                        <button onClick={handleSubmit} disabled={submitting}
                            className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium mt-4 disabled:opacity-60">
                            {submitting ? 'Saving...' : (editProduct ? 'Update Product' : 'Create Product')}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-border">
                            <tr>
                                {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Approved', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-10 text-gray-400">No products yet</td></tr>
                            ) : products.map(p => (
                                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="px-4 py-3">
                                        {p.images?.[0]
                                            ? <img src={p.images[0]} alt={p.name_en} className="w-10 h-10 object-cover rounded-lg" />
                                            : <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">No img</div>
                                        }
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{p.name_en}</div>
                                        <div className="text-xs text-gray-400">{p.name_bn}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{p.category_name}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">৳{p.price}</div>
                                        {p.sale_price && <div className="text-xs text-green-600">Sale: ৳{p.sale_price}</div>}
                                    </td>
                                    <td className="px-4 py-3">{p.stock_quantity}</td>
                                    <td className="px-4 py-3"><Badge text={p.status} /></td>
                                    <td className="px-4 py-3">
                                        {p.is_approved
                                            ? <span className="text-xs text-green-600 font-medium">✓ Approved</span>
                                            : <button onClick={() => handleApprove(p.id)}
                                                className="text-xs border border-green-200 text-green-700 px-2 py-1 rounded-lg hover:bg-green-50">
                                                Approve
                                            </button>
                                        }
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(p)}
                                                className="text-xs border border-border px-2 py-1 rounded-lg hover:bg-gray-50">Edit</button>
                                            <button onClick={() => handleDelete(p.id)}
                                                className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded-lg hover:bg-red-50">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ── Settings ──────────────────────────────────────────────────────
const Settings = ({ toast }) => {
    const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });

    const handleSubmit = async () => {
        if (!form.old_password || !form.new_password) return toast('All fields required');
        if (form.new_password !== form.confirm) return toast('Passwords do not match');
        try {
            await adminApi.adminChangePassword(form.old_password, form.new_password);
            setForm({ old_password: '', new_password: '', confirm: '' });
            toast('Password changed successfully');
        } catch (e) {
            toast(e.response?.data?.detail || 'Error changing password');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-heading text-primary mb-1">Settings</h2>
            <p className="text-sm text-gray-500 mb-6">Admin account settings</p>
            <div className="bg-white border border-border rounded-xl p-6 max-w-md">
                <h3 className="text-base font-semibold mb-4">Change Password</h3>
                {[
                    { label: 'Current Password', key: 'old_password' },
                    { label: 'New Password', key: 'new_password' },
                    { label: 'Confirm New Password', key: 'confirm' },
                ].map(f => (
                    <div key={f.key} className="mb-3">
                        <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                        <input type="password" value={form[f.key]}
                            onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                            className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                    </div>
                ))}
                <button onClick={handleSubmit}
                    className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium mt-2">
                    Update Password
                </button>
            </div>
        </div>
    );
};

// ── Main AdminPanelPage ───────────────────────────────────────────
const AdminPanelPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [toast, setToast] = useState(null);
    const userName = localStorage.getItem('user_name') || 'Admin';

    useEffect(() => {
        adminApi.getStats().then(r => setStats(r.data)).catch(() => { });
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/admin', label: 'Dashboard', end: true },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/orders', label: 'Orders' },
        { to: '/admin/products', label: 'Products' },
        { to: '/admin/settings', label: 'Settings' },
    ];

    return (
        <div className="-mx-4 -my-6">
            {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
            <div className="flex min-h-screen">
                <aside className="w-52 bg-white border-r border-border flex flex-col">
                    <div className="p-5 border-b border-border">
                        <p className="text-xs text-gray-400">Logged in as</p>
                        <p className="font-semibold text-sm truncate">{userName}</p>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">admin</span>
                    </div>
                    <nav className="flex-1 py-3">
                        <p className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
                        {navItems.map(item => (
                            <NavLink key={item.to} to={item.to} end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2.5 text-sm transition-colors ${isActive
                                        ? 'bg-amber-50 text-primary font-medium border-r-2 border-primary'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`
                                }>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-border">
                        <button onClick={handleLogout}
                            className="w-full text-sm text-red-500 border border-red-200 py-2 rounded-lg hover:bg-red-50">
                            Logout
                        </button>
                    </div>
                </aside>

                <main className="flex-1 p-6 bg-background overflow-y-auto">
                    <Routes>
                        <Route index element={<Dashboard stats={stats} />} />
                        <Route path="users" element={<Users toast={showToast} />} />
                        <Route path="orders" element={<Orders toast={showToast} />} />
                        <Route path="products" element={<Products toast={showToast} />} />
                        <Route path="settings" element={<Settings toast={showToast} />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminPanelPage;
