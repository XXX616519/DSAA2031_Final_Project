const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由配置
app.use('/api', require('./routes/admin'));
app.use('/api', require('./routes/student'));
app.use('/api', require('./routes/teacher'));
app.use('/api', require('./routes/login'));

// 数据库连接检查
app.get('/health', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT DATABASE() AS db');
    console.log(`Connected to database: ${result[0].db}`);
    res.json({ database: 'connected' });
  } catch (error) {
    res.status(500).json({ database: 'disconnected' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 