import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import * as userApi from '../../api/user';
import { changePassword, logout } from '../../api/auth';

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

// ── My Orders ─────────────────────────────────────────────────────
const MyOrders = ({ toast }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [payOrder, setPayOrder] = useState(null);
    const [txnId, setTxnId] = useState('');

    useEffect(() => {
        userApi.getMyOrders().then(r => setOrders(r.data)).finally(() => setLoading(false));
    }, []);

    const handleCancel = async (id) => {
        if (!confirm('Cancel this order?')) return;
        try {
            await userApi.cancelOrder(id);
            setOrders(o => o.map(x => x.id === id ? { ...x, status: 'cancelled' } : x));
            toast('Order cancelled');
        } catch (e) { toast(e.response?.data?.detail || 'Error'); }
    };

    const handleVerify = async () => {
        if (!txnId) return toast('Transaction ID required');
        try {
            await userApi.verifyPayment(payOrder.id, txnId);
            setOrders(o => o.map(x => x.id === payOrder.id ? { ...x, notes: (x.notes || '') + ` | TXN: ${txnId}` } : x));
            setPayOrder(null);
            setTxnId('');
            toast('Transaction submitted! Admin will verify shortly.');
        } catch (e) { toast(e.response?.data?.detail || 'Error'); }
    };

    if (loading) return <p className="text-gray-400">Loading...</p>;

    return (
        <div>
            <h2 className="text-2xl font-heading text-primary mb-1">My Orders</h2>
            <p className="text-sm text-gray-500 mb-6">Track all your orders</p>

            {selected && (
                <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary">Order Details</h3>
                            <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">✕</button>
                        </div>
                        <div className="text-sm space-y-1 mb-4">
                            <p><strong>Order ID:</strong> {selected.id}</p>
                            <p><strong>Status:</strong> <Badge text={selected.status} /></p>
                            <p><strong>Payment:</strong> {selected.payment_method?.toUpperCase()} — <Badge text={selected.payment_status} /></p>
                            {selected.payment_transaction_id && <p><strong>TXN ID:</strong> {selected.payment_transaction_id}</p>}
                            <p><strong>Date:</strong> {fmtDate(selected.created_at)}</p>
                            {selected.notes && <p><strong>Notes:</strong> {selected.notes}</p>}
                        </div>
                        <table className="w-full text-sm mb-3">
                            <thead><tr className="border-b"><th className="text-left py-1">Product</th><th>Qty</th><th>Total</th></tr></thead>
                            <tbody>
                                {selected.items?.map((i, idx) => (
                                    <tr key={idx} className="border-b border-gray-50">
                                        <td className="py-1">{i.product_snapshot?.name}</td>
                                        <td className="text-center">{i.quantity}</td>
                                        <td className="text-right">{fmt(i.total_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-between font-bold text-primary pt-2 border-t">
                            <span>Total</span><span>{fmt(selected.total_amount)}</span>
                        </div>
                    </div>
                </div>
            )}

            {payOrder && (
                <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary">Submit Payment</h3>
                            <button onClick={() => setPayOrder(null)} className="text-gray-400 text-xl">✕</button>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
                            Send <strong>{fmt(payOrder.total_amount)}</strong> via <strong>{payOrder.payment_method?.toUpperCase()}</strong> to <strong>01749-905295</strong> then enter the transaction ID below.
                        </div>
                        <div className="mb-4">
                            <label className="text-xs text-gray-500 block mb-1">Transaction ID</label>
                            <input value={txnId} onChange={e => setTxnId(e.target.value)}
                                placeholder="e.g. 8N3X7KQPMA"
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <button onClick={handleVerify}
                            className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium">
                            Submit Transaction ID
                        </button>
                    </div>
                </div>
            )}

            {orders.length === 0
                ? <div className="bg-white border border-border rounded-xl p-12 text-center text-gray-400">No orders yet.</div>
                : (
                    <div className="bg-white border border-border rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-border">
                                    <tr>
                                        {['Order ID', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-mono text-xs text-primary">{o.id.slice(0, 8)}...</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{o.items?.length} item(s)</td>
                                            <td className="px-4 py-3 font-medium">{fmt(o.total_amount)}</td>
                                            <td className="px-4 py-3 uppercase text-xs">{o.payment_method}</td>
                                            <td className="px-4 py-3"><Badge text={o.status} /></td>
                                            <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(o.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <button onClick={() => setSelected(o)}
                                                        className="text-xs border border-border px-2 py-1 rounded-lg hover:bg-gray-50">Detail</button>
                                                    {o.status === 'pending' && o.payment_method !== 'cod' && o.payment_status === 'unpaid' &&
                                                        <button onClick={() => setPayOrder(o)}
                                                            className="text-xs border border-primary text-primary px-2 py-1 rounded-lg hover:bg-amber-50">Pay</button>
                                                    }
                                                    {o.status === 'pending' &&
                                                        <button onClick={() => handleCancel(o.id)}
                                                            className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded-lg hover:bg-red-50">Cancel</button>
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

// ── Cart ──────────────────────────────────────────────────────────
const Cart = ({ toast }) => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCheckout, setShowCheckout] = useState(false);
    const [payMethod, setPayMethod] = useState('bkash');
    const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', district: '' });

    useEffect(() => {
        userApi.getCart().then(r => setCart(r.data)).finally(() => setLoading(false));
    }, []);

    const handleQty = async (id, qty) => {
        try {
            await userApi.updateCartItem(id, qty);
            if (qty <= 0) setCart(c => c.filter(x => x.id !== id));
            else setCart(c => c.map(x => x.id === id ? { ...x, quantity: qty } : x));
        } catch (e) { toast('Error updating quantity'); }
    };

    const handleRemove = async (id) => {
        try {
            await userApi.removeCartItem(id);
            setCart(c => c.filter(x => x.id !== id));
            toast('Removed from cart');
        } catch (e) { toast('Error removing item'); }
    };

    const total = cart.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
    const deliveryCharge = 60;

    const handleCheckout = async () => {
        if (!address.name || !address.phone || !address.street || !address.city) {
            return toast('Please fill all address fields');
        }
        try {
            const r = await userApi.placeOrder(payMethod, address);
            toast('Order placed! ID: ' + r.data.order_id);
            setCart([]);
            setShowCheckout(false);
            navigate('/dashboard');
        } catch (e) { toast(e.response?.data?.detail || 'Error placing order'); }
    };

    if (loading) return <p className="text-gray-400">Loading...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-heading text-primary">My Cart</h2>
                    <p className="text-sm text-gray-500">{cart.length} item(s)</p>
                </div>
                {cart.length > 0 &&
                    <button onClick={() => setShowCheckout(true)}
                        className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary/90">
                        Checkout {fmt(total + deliveryCharge)}
                    </button>
                }
            </div>

            {showCheckout && (
                <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary">Checkout</h3>
                            <button onClick={() => setShowCheckout(false)} className="text-gray-400 text-xl">✕</button>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-sm mb-4">
                            {cart.length} items · Delivery ৳{deliveryCharge} · <strong>Total {fmt(total + deliveryCharge)}</strong>
                        </div>
                        <h4 className="text-sm font-semibold mb-2">Delivery Address</h4>
                        {[
                            { label: 'Full Name', key: 'name' },
                            { label: 'Phone', key: 'phone' },
                            { label: 'Street / Area', key: 'street' },
                            { label: 'City', key: 'city' },
                            { label: 'District', key: 'district' },
                        ].map(f => (
                            <div key={f.key} className="mb-2">
                                <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                                <input value={address[f.key]}
                                    onChange={e => setAddress(a => ({ ...a, [f.key]: e.target.value }))}
                                    className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                            </div>
                        ))}
                        <h4 className="text-sm font-semibold mt-4 mb-2">Payment Method</h4>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {[
                                { id: 'bkash', label: 'bKash', color: 'bg-pink-600', short: 'bK' },
                                { id: 'sslcommerz', label: 'Card', color: 'bg-blue-600', short: '💳' },
                                { id: 'cod', label: 'Cash on Delivery', color: 'bg-green-700', short: 'COD' },
                            ].map(m => (
                                <button key={m.id} onClick={() => setPayMethod(m.id)}
                                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${payMethod === m.id ? 'border-primary bg-amber-50' : 'border-border'}`}>
                                    <div className={`${m.color} text-white text-xs px-2 py-0.5 rounded-full mb-1 inline-block`}>{m.short}</div>
                                    <div className="text-xs">{m.label}</div>
                                </button>
                            ))}
                        </div>
                        <button onClick={handleCheckout}
                            className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium">
                            Place Order
                        </button>
                    </div>
                </div>
            )}

            {cart.length === 0
                ? <div className="bg-white border border-border rounded-xl p-12 text-center text-gray-400">Your cart is empty.</div>
                : (
                    <div className="bg-white border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-border">
                                <tr>
                                    {['Product', 'Price', 'Qty', 'Subtotal', ''].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map(i => (
                                    <tr key={i.id} className="border-b border-gray-50">
                                        <td className="px-4 py-3 font-medium">{i.product?.name || 'Unknown'}</td>
                                        <td className="px-4 py-3">{fmt(i.product?.price || 0)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleQty(i.id, i.quantity - 1)}
                                                    className="w-6 h-6 border border-border rounded flex items-center justify-center text-gray-500 hover:bg-gray-50">−</button>
                                                <span className="w-6 text-center">{i.quantity}</span>
                                                <button onClick={() => handleQty(i.id, i.quantity + 1)}
                                                    className="w-6 h-6 border border-border rounded flex items-center justify-center text-gray-500 hover:bg-gray-50">+</button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium">{fmt((i.product?.price || 0) * i.quantity)}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => handleRemove(i.id)}
                                                className="text-xs border border-red-200 text-red-500 px-2 py-1 rounded-lg hover:bg-red-50">Remove</button>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50">
                                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold">Delivery:</td>
                                    <td colSpan={2} className="px-4 py-3 font-medium">{fmt(deliveryCharge)}</td>
                                </tr>
                                <tr className="bg-amber-50">
                                    <td colSpan={3} className="px-4 py-3 text-right font-bold">Total:</td>
                                    <td colSpan={2} className="px-4 py-3 font-bold text-primary text-base">{fmt(total + deliveryCharge)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )
            }
        </div>
    );
};

// ── Profile ───────────────────────────────────────────────────────
const Profile = ({ toast }) => {
    const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' });
    const userName = localStorage.getItem('user_name') || '';
    const userEmail = localStorage.getItem('user_email') || '';

    const handleSubmit = async () => {
        if (!form.old_password || !form.new_password) return toast('All fields required');
        if (form.new_password !== form.confirm) return toast('Passwords do not match');
        try {
            await changePassword(form.old_password, form.new_password);
            setForm({ old_password: '', new_password: '', confirm: '' });
            toast('Password changed successfully');
        } catch (e) { toast(e.response?.data?.detail || 'Error'); }
    };

    return (
        <div>
            <h2 className="text-2xl font-heading text-primary mb-1">My Profile</h2>
            <p className="text-sm text-gray-500 mb-6">Account settings</p>
            <div className="bg-white border border-border rounded-xl p-6 max-w-md mb-4">
                <h3 className="text-base font-semibold mb-3">Account Info</h3>
                <p className="text-sm mb-1"><strong>Name:</strong> {userName}</p>
                <p className="text-sm"><strong>Email:</strong> {userEmail}</p>
            </div>
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

// ── Main DashboardPage ────────────────────────────────────────────
const DashboardPage = () => {
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const userName = localStorage.getItem('user_name') || 'User';

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', label: 'My Orders', end: true },
        { to: '/dashboard/cart', label: 'Cart' },
        { to: '/dashboard/profile', label: 'Profile' },
    ];

    return (
        <div className="-mx-4 -my-6">
            {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
            <div className="flex min-h-screen">
                <aside className="w-52 bg-white border-r border-border flex flex-col">
                    <div className="p-5 border-b border-border">
                        <p className="text-xs text-gray-400">Logged in as</p>
                        <p className="font-semibold text-sm truncate">{userName}</p>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">customer</span>
                    </div>
                    <nav className="flex-1 py-3">
                        <p className="px-4 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">My Account</p>
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
                        <Route index element={<MyOrders toast={showToast} />} />
                        <Route path="cart" element={<Cart toast={showToast} />} />
                        <Route path="profile" element={<Profile toast={showToast} />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;