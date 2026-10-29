import 'dotenv/config';
import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGODB_URI, { dbName: '237212DoanQuocTien' });
const foods = [
  { foodId: 'PHO-001', name: 'Phở bò tái', category: 'Món nước', cuisine: 'Miền Bắc', ingredients: ['bánh phở', 'thịt bò', 'hành', 'nước dùng'], price: 65000, quantity: 20, description: 'Phở bò truyền thống với nước dùng ninh xương.', imageUrl: '' },
  { foodId: 'BUN-001', name: 'Bún chả Hà Nội', category: 'Món nướng', cuisine: 'Miền Bắc', ingredients: ['bún', 'thịt heo', 'nước mắm', 'rau sống'], price: 55000, quantity: 15, description: 'Thịt nướng than ăn cùng bún và nước chấm.', imageUrl: '' },
  { foodId: 'COM-001', name: 'Cơm tấm sườn', category: 'Cơm', cuisine: 'Miền Nam', ingredients: ['cơm tấm', 'sườn heo', 'trứng', 'đồ chua'], price: 60000, quantity: 18, description: 'Cơm tấm sườn nướng kèm trứng và đồ chua.', imageUrl: '' }
];
const schema = new mongoose.Schema({ foodId: { type: String, unique: true }, name: String, category: String, cuisine: String, ingredients: [String], price: Number, quantity: Number, description: String, imageUrl: String }, { timestamps: true, collection: 'foods' });
const Food = mongoose.model('FoodSeed', schema);
for (const food of foods) await Food.updateOne({ foodId: food.foodId }, { $setOnInsert: food }, { upsert: true });
console.log(`Đã bảo đảm ${foods.length} món mẫu trong foods.`);
await mongoose.disconnect();
