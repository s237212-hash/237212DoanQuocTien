import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin(origin, done) {
  const allowed = (process.env.CLIENT_ORIGIN || '*').split(',').map((s) => s.trim());
  if (!origin || allowed.includes('*') || allowed.includes(origin)) return done(null, true);
  return done(new Error('Origin is not allowed by CORS'));
} }));
app.use(express.json({ limit: '1mb' }));

const foodSchema = new mongoose.Schema({
  foodId: { type: String, required: true, unique: true, trim: true, maxlength: 40 },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  cuisine: { type: String, required: true, trim: true, maxlength: 80 },
  ingredients: { type: [String], required: true, validate: (v) => v.length > 0 },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, validate: Number.isInteger },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  imageUrl: { type: String, default: '', trim: true }
}, { timestamps: true, collection: 'foods' });
const Food = mongoose.model('Food', foodSchema);

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.get('/api/foods', async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const filter = search ? { $or: ['name', 'category', 'cuisine'].map((field) => ({ [field]: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } })) } : {};
    res.json(await Food.find(filter).sort({ name: 1 }).lean());
  } catch (e) { next(e); }
});
app.get('/api/foods/:id', async (req, res, next) => {
  try { const food = await Food.findById(req.params.id).lean(); return food ? res.json(food) : res.status(404).json({ message: 'Không tìm thấy món ăn.' }); }
  catch (e) { next(e); }
});
app.post('/api/foods', async (req, res, next) => {
  try { const food = await Food.create(req.body); return res.status(201).json(food); } catch (e) { next(e); }
});
app.put('/api/foods/:id', async (req, res, next) => {
  try { const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); return food ? res.json(food) : res.status(404).json({ message: 'Không tìm thấy món ăn.' }); }
  catch (e) { next(e); }
});
app.delete('/api/foods/:id', async (req, res, next) => {
  try { const food = await Food.findByIdAndDelete(req.params.id); return food ? res.json({ message: 'Đã xóa món ăn.' }) : res.status(404).json({ message: 'Không tìm thấy món ăn.' }); }
  catch (e) { next(e); }
});
app.use((req, res) => res.status(404).json({ message: `Không có endpoint ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  if (err?.code === 11000) return res.status(409).json({ message: 'Mã món ăn đã tồn tại.' });
  if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError || err?.name === 'SyntaxError') return res.status(400).json({ message: err.message });
  if (err.message === 'Origin is not allowed by CORS') return res.status(403).json({ message: err.message });
  console.error(err);
  return res.status(500).json({ message: 'Lỗi máy chủ hoặc kết nối cơ sở dữ liệu.' });
});

const port = Number(process.env.PORT) || 5000;
async function start() {
  app.listen(port, '0.0.0.0', () => console.log(`API đang chạy tại cổng ${port}`));
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI chưa được cấu hình; API đang chạy nhưng chưa kết nối cơ sở dữ liệu.');
    return;
  }
  mongoose.connect(process.env.MONGODB_URI, { dbName: '237212DoanQuocTien', serverSelectionTimeoutMS: 10000 })
    .then(() => console.log('Đã kết nối MongoDB Atlas.'))
    .catch((err) => console.error('Không thể kết nối MongoDB Atlas:', err.message));
}
start();
