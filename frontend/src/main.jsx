import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const api = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const blank = { foodId: '', name: '', category: '', cuisine: '', ingredients: '', price: '', quantity: '', description: '', imageUrl: '' };
const money = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n || 0);
async function request(path, options = {}) {
  const response = await fetch(`${api}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Yêu cầu thất bại (${response.status})`);
  return data;
}

function App() {
  const [foods, setFoods] = useState([]), [search, setSearch] = useState(''), [loading, setLoading] = useState(true);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [editing, setEditing] = useState(null), [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blank), [saving, setSaving] = useState(false);
  const load = async () => { setLoading(true); setError(''); try { const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''; setFoods(await request(`/api/foods${q}`)); } catch (e) { setError(`${e.message}. Hãy kiểm tra API và biến VITE_API_URL.`); } finally { setLoading(false); } };
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [search]);
  const stats = useMemo(() => ({ count: foods.length, stock: foods.reduce((a, f) => a + Number(f.quantity || 0), 0), value: foods.reduce((a, f) => a + Number(f.price || 0) * Number(f.quantity || 0), 0) }), [foods]);
  const startEdit = (food) => { setEditing(food?._id || 'new'); setForm(food ? { ...food, ingredients: food.ingredients.join(', ') } : blank); setSelected(null); };
  const save = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    const payload = { ...form, ingredients: form.ingredients.split(',').map((x) => x.trim()).filter(Boolean), price: Number(form.price), quantity: Number(form.quantity) };
    try { await request(editing === 'new' ? '/api/foods' : `/api/foods/${editing}`, { method: editing === 'new' ? 'POST' : 'PUT', body: JSON.stringify(payload) }); setNotice(editing === 'new' ? 'Đã thêm món ăn.' : 'Đã cập nhật món ăn.'); setEditing(null); await load(); }
    catch (e2) { setError(e2.message); } finally { setSaving(false); }
  };
  const remove = async (food) => { if (!window.confirm(`Xóa “${food.name}”?`)) return; try { await request(`/api/foods/${food._id}`, { method: 'DELETE' }); setNotice('Đã xóa món ăn.'); await load(); } catch (e) { setError(e.message); } };
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 3200); return () => clearTimeout(t); }, [notice]);

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-icon">B</span><span>Bếp Nhà<small>QUẢN LÝ THỰC ĐƠN</small></span></a><div className="top-note"><span className="live-dot"/> Không gian bếp của bạn</div></header>
    <section className="hero"><div><p className="eyebrow">THỰC ĐƠN HÔM NAY</p><h1>Món ngon, <em>đủ đầy.</em></h1><p className="hero-copy">Quản lý thực đơn và nguyên liệu của bạn trong một góc nhỏ thật gọn gàng.</p></div><div className="hero-art" aria-hidden="true"><span>✳</span><div>🍜</div></div></section>
    <section className="stats"><article><span className="stat-icon peach">✦</span><div><small>MÓN TRONG THỰC ĐƠN</small><strong>{stats.count}<i> món</i></strong></div></article><article><span className="stat-icon green">◉</span><div><small>TỔNG SỐ PHẦN CÒN</small><strong>{stats.stock}<i> phần</i></strong></div></article><article><span className="stat-icon yellow">↗</span><div><small>GIÁ TRỊ TỒN KHO</small><strong>{money(stats.value)}</strong></div></article></section>
    <section className="menu-head"><div><p className="eyebrow">BỘ SƯU TẬP</p><h2>Thực đơn <span>của mình</span></h2></div><button className="primary" onClick={() => startEdit(null)}><b>＋</b> Thêm món mới</button></section>
    <section className="toolbar"><label className="search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên món, loại món, vùng miền..."/><kbd>/</kbd></label><span className="result-count">{foods.length} món ăn</span></section>
    {notice && <div className="toast success">✓ {notice}</div>}{error && <div className="toast error">{error}<button onClick={() => setError('')}>×</button></div>}
    {loading ? <div className="empty"><span className="spinner"/> Đang tải thực đơn...</div> : foods.length === 0 ? <div className="empty"><div className="empty-icon">🥣</div><h3>{search ? 'Chưa tìm thấy món phù hợp' : 'Thực đơn đang chờ món ngon'}</h3><p>{search ? 'Thử một từ khóa khác nhé.' : 'Thêm món đầu tiên để bắt đầu quản lý.'}</p>{!search && <button className="primary" onClick={() => startEdit(null)}>＋ Thêm món mới</button>}</div> : <section className="grid">{foods.map((food, i) => <article className="food-card" key={food._id} style={{ '--delay': `${i * 55}ms` }}>
      <div className={`food-image food-image-${i % 4}`}>{food.imageUrl ? <img src={food.imageUrl} alt={food.name} onError={(e) => { e.currentTarget.style.display = 'none'; }}/> : <span>{['🍜', '🍚', '🥗', '🍲'][i % 4]}</span>}<span className="category">{food.category}</span><button className="more" onClick={() => setSelected(food)} aria-label="Xem chi tiết">···</button></div>
      <div className="food-body"><p className="cuisine">⌖ {food.cuisine}</p><h3>{food.name}</h3><p className="ingredients">{food.ingredients?.join(' · ')}</p><div className="food-foot"><strong>{money(food.price)}</strong><span className={food.quantity < 5 ? 'low-stock' : ''}>Còn {food.quantity} phần</span></div><div className="card-actions"><button onClick={() => setSelected(food)}>Chi tiết</button><button onClick={() => startEdit(food)}>Sửa</button><button className="delete" onClick={() => remove(food)}>Xóa</button></div></div>
    </article>)}</section>}
    <footer>GỌN GÀNG TỪ CĂN BẾP NHỎ <span>✳</span></footer>
    {editing && <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}><form className="dialog" onSubmit={save}><div className="dialog-head"><div><p className="eyebrow">{editing === 'new' ? 'THÊM MÓN MỚI' : 'CHỈNH SỬA'}</p><h2>{editing === 'new' ? 'Món gì đây nhỉ?' : 'Cập nhật món ăn'}</h2></div><button type="button" className="close" onClick={() => setEditing(null)}>×</button></div>
      <div className="form-grid">{[['foodId','Mã món ăn','PHO-001'],['name','Tên món ăn','Phở bò tái'],['category','Loại món','Món nước'],['cuisine','Ẩm thực / vùng miền','Miền Bắc'],['price','Giá bán (VNĐ)','65000'],['quantity','Số lượng','20'],['ingredients','Nguyên liệu (phân cách dấu phẩy)','bánh phở, thịt bò']].map(([key,label,placeholder])=><label className={key==='ingredients'?'wide':''} key={key}>{label}<input required value={form[key] ?? ''} placeholder={placeholder} type={['price','quantity'].includes(key)?'number':'text'} min={['price','quantity'].includes(key)?0:undefined} step="any" onChange={(e) => setForm({...form,[key]:e.target.value})}/></label>)}<label className="wide">Mô tả<textarea required rows="3" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/></label><label className="wide">Đường dẫn hình ảnh (tùy chọn)<input type="url" value={form.imageUrl} onChange={(e)=>setForm({...form,imageUrl:e.target.value})}/></label></div>
      <div className="dialog-actions"><button type="button" className="secondary" onClick={() => setEditing(null)}>Để sau</button><button className="primary" disabled={saving}>{saving?'Đang lưu...':'Lưu món ăn'}</button></div></form></div>}
    {selected && <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}><section className="dialog detail"><button className="close" onClick={() => setSelected(null)}>×</button><p className="eyebrow">CHI TIẾT MÓN ĂN · {selected.foodId}</p><h2>{selected.name}</h2><p className="detail-price">{money(selected.price)}</p><p>{selected.description}</p><dl><div><dt>Loại món</dt><dd>{selected.category}</dd></div><div><dt>Ẩm thực</dt><dd>{selected.cuisine}</dd></div><div><dt>Nguyên liệu</dt><dd>{selected.ingredients?.join(', ')}</dd></div><div><dt>Còn lại</dt><dd>{selected.quantity} phần</dd></div></dl><button className="primary" onClick={() => startEdit(selected)}>Chỉnh sửa món</button></section></div>}
  </main>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
