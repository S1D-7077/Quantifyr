import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "quantifyr-secret";

app.use(express.json());

// --- Database Setup ---
const db = new Database("quantifyr.db");
db.pragma("journal_mode = WAL");

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    business_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    platform TEXT,
    name TEXT,
    status TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    platform TEXT,
    name TEXT,
    status TEXT,
    ad_spend REAL DEFAULT 0,
    revenue REAL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    external_id TEXT,
    revenue REAL,
    cogs REAL,
    shipping_cost REAL,
    rto_cost REAL DEFAULT 0,
    gateway_fee REAL,
    packaging_cost REAL,
    discount REAL,
    status TEXT,
    region TEXT,
    pincode TEXT,
    sku TEXT,
    campaign_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
  );

  CREATE TABLE IF NOT EXISTS blocked_pincodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    pincode TEXT,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS blocked_skus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    sku TEXT,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    severity TEXT,
    title TEXT,
    description TEXT,
    action TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Apply schema migrations
try { db.exec("ALTER TABLE orders ADD COLUMN pincode TEXT;"); } catch (e) {}
try { 
  db.exec(`
    CREATE TABLE IF NOT EXISTS blocked_skus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      sku TEXT,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `); 
} catch (e) {}

// --- Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post("/api/auth/register", async (req, res) => {
  const { email, password, business_name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const stmt = db.prepare("INSERT INTO users (email, password, business_name) VALUES (?, ?, ?)");
    const info = stmt.run(email, hashedPassword, business_name);
    const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET);
    res.json({ token, user: { id: info.lastInsertRowid, email, business_name } });
  } catch (e) {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email, business_name: user.business_name } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// --- Data Routes ---
app.get("/api/dashboard/summary", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  
  // Mocking some aggregation for the dashboard
  const stats = db.prepare(`
    SELECT 
      SUM(revenue) as total_revenue,
      SUM(cogs + shipping_cost + rto_cost + gateway_fee + packaging_cost) as total_costs,
      SUM(revenue - (cogs + shipping_cost + rto_cost + gateway_fee + packaging_cost + discount)) as net_profit,
      COUNT(id) as total_orders
    FROM orders WHERE user_id = ?
  `).get(userId) as any;

  const adSpend = db.prepare("SELECT SUM(ad_spend) as total_ad_spend FROM campaigns WHERE user_id = ?").get(userId) as any;
  
  const rtoStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'RTO' THEN 1 ELSE 0 END) as rto_count
    FROM orders WHERE user_id = ?
  `).get(userId) as any;

  res.json({
    revenue: stats.total_revenue || 0,
    net_profit: (stats.net_profit || 0) - (adSpend.total_ad_spend || 0),
    ad_spend: adSpend.total_ad_spend || 0,
    margin: stats.total_revenue ? (((stats.net_profit - (adSpend.total_ad_spend || 0)) / stats.total_revenue) * 100).toFixed(2) : 0,
    rto_rate: rtoStats.total ? ((rtoStats.rto_count / rtoStats.total) * 100).toFixed(2) : 0,
    total_orders: stats.total_orders || 0
  });
});

app.get("/api/campaigns", authenticateToken, (req: any, res) => {
  const campaigns = db.prepare("SELECT * FROM campaigns WHERE user_id = ?").all(req.user.id);
  res.json(campaigns);
});

app.get("/api/campaigns/analysis", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const campaigns = db.prepare(`
    SELECT 
      c.*,
      COUNT(o.id) as order_count,
      SUM(o.revenue) as calculated_revenue,
      SUM(o.cogs + o.shipping_cost + o.rto_cost + o.gateway_fee + o.packaging_cost + o.discount) as total_expenses,
      SUM(CASE WHEN o.status = 'RTO' THEN 1 ELSE 0 END) as rto_count
    FROM campaigns c
    LEFT JOIN orders o ON c.id = o.campaign_id
    WHERE c.user_id = ?
    GROUP BY c.id
  `).all(userId) as any[];

  const analysis = campaigns.map(c => {
    const netProfit = (c.calculated_revenue || 0) - (c.ad_spend || 0) - (c.total_expenses || 0);
    return {
      ...c,
      roas: c.ad_spend ? (c.calculated_revenue / c.ad_spend).toFixed(2) : 0,
      cac: c.order_count ? (c.ad_spend / c.order_count).toFixed(2) : 0,
      net_profit: netProfit.toFixed(2),
      rto_rate: c.order_count ? ((c.rto_count / c.order_count) * 100).toFixed(2) : 0,
      margin: c.calculated_revenue ? ((netProfit / c.calculated_revenue) * 100).toFixed(2) : 0
    };
  });

  res.json(analysis);
});

app.get("/api/campaigns/trends", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const performanceData = db.prepare(`
    SELECT 
      DATE(created_at) as date,
      SUM(revenue) as revenue
    FROM orders
    WHERE user_id = ?
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all(userId) as any[];

  const adSpendResult = db.prepare("SELECT SUM(ad_spend) as total_ad_spend FROM campaigns WHERE user_id = ?").get(userId) as any;
  const totalAdSpend = adSpendResult.total_ad_spend || 0;

  const activeDays = performanceData.length;
  const dailySpend = activeDays > 0 ? (totalAdSpend / activeDays) : 0;

  const trends = performanceData.map((day, index) => {
    const randomFactor = 0.8 + (Math.sin(index) * 0.4); 
    const spend = Math.round(dailySpend * randomFactor);
    return {
      date: day.date,
      revenue: Math.round(day.revenue),
      ad_spend: spend < 0 ? 0 : spend
    };
  });

  res.json(trends);
});

app.get("/api/campaigns/:id/details", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const campaignId = req.params.id;

  // 1. Basic Campaign Info
  const campaign = db.prepare(`
    SELECT * FROM campaigns WHERE id = ? AND user_id = ?
  `).get(campaignId, userId) as any;

  if (!campaign) return res.status(404).json({ error: "Campaign not found" });

  // 2. SKU Performance in this campaign
  const skus = db.prepare(`
    SELECT 
      sku,
      COUNT(id) as order_count,
      SUM(revenue) as revenue,
      SUM(revenue - (cogs + shipping_cost + rto_cost + gateway_fee + packaging_cost + discount)) as net_profit
    FROM orders
    WHERE campaign_id = ? AND user_id = ?
    GROUP BY sku
    ORDER BY net_profit DESC
  `).all(campaignId, userId);

  // 3. RTO Data
  const regions = db.prepare(`
    SELECT 
      region,
      COUNT(id) as order_count,
      SUM(CASE WHEN status = 'RTO' THEN 1 ELSE 0 END) as rto_count,
      SUM(CASE WHEN status = 'RTO' THEN rto_cost ELSE 0 END) as rto_loss
    FROM orders
    WHERE campaign_id = ? AND user_id = ?
    GROUP BY region
  `).all(campaignId, userId);

  // 4. Performance over time
  const performanceData = db.prepare(`
    SELECT 
      DATE(created_at) as date,
      SUM(revenue) as revenue,
      SUM(revenue - (cogs + shipping_cost + rto_cost + gateway_fee + packaging_cost + discount)) as net_profit
    FROM orders
    WHERE campaign_id = ? AND user_id = ?
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all(campaignId, userId) as any[];

  // Calculate ROAS trend
  // For demo: distribute total ad_spend evenly across active days
  const activeDays = performanceData.length;
  const dailySpend = activeDays > 0 ? (campaign.ad_spend / activeDays) : 0;

  const performanceOverTime = performanceData.map(day => ({
    ...day,
    roas: dailySpend > 0 ? (day.revenue / dailySpend).toFixed(2) : 0
  }));

  res.json({
    campaign,
    skus,
    regions,
    performanceOverTime
  });
});

app.get("/api/orders", authenticateToken, (req: any, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 100").all(req.user.id);
  res.json(orders);
});

app.get("/api/alerts", authenticateToken, (req: any, res) => {
  const alerts = db.prepare("SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  res.json(alerts);
});

// --- Seed Data Endpoint (for demo) ---
app.post("/api/seed", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  
  // Clear existing for this user
  db.prepare("DELETE FROM campaigns WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM orders WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM alerts WHERE user_id = ?").run(userId);

  // Seed Campaigns
  const camp1 = db.prepare("INSERT INTO campaigns (user_id, platform, name, status, ad_spend, revenue) VALUES (?, ?, ?, ?, ?, ?)").run(userId, "Meta", "Summer Sale 2024", "Active", 5000, 15000);
  const camp2 = db.prepare("INSERT INTO campaigns (user_id, platform, name, status, ad_spend, revenue) VALUES (?, ?, ?, ?, ?, ?)").run(userId, "Google", "Search - Best Sellers", "Active", 2000, 8000);

  // Seed Orders
  const regions = ["North", "South", "East", "West", "Central"];
  const pincodeData: Record<string, string[]> = {
    "North": ["110001", "110002", "110003", "110004"],
    "South": ["560001", "560002", "560003", "560004"],
    "East": ["700001", "700002", "700003", "700004"],
    "West": ["400001", "400002", "400003", "400004"],
    "Central": ["462001", "462002", "462003", "462004"]
  };
  const skus = ["SKU-A", "SKU-B", "SKU-C"];
  
  // Generate 200 orders for better AI analysis
  for (let i = 0; i < 200; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const regionPincodes = pincodeData[region];
    const pincode = regionPincodes[Math.floor(Math.random() * regionPincodes.length)];
    
    // Higher RTO in North and specifically pincode 110001
    let rtoChance = 0.12;
    if (region === "North") rtoChance = 0.25;
    if (pincode === "110001") rtoChance = 0.45;
    
    const isRTO = Math.random() < rtoChance;
    
    // Use varying dates over last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const createdAt = date.toISOString();

    db.prepare(`
      INSERT INTO orders (user_id, external_id, revenue, cogs, shipping_cost, rto_cost, gateway_fee, packaging_cost, discount, status, region, pincode, sku, campaign_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, 
      `ORD-${1000 + i}`, 
      200 + Math.random() * 300, 
      80, 
      40, 
      isRTO ? 60 : 0, 
      10, 
      5, 
      Math.random() * 20, 
      isRTO ? "RTO" : "Delivered",
      region,
      pincode,
      skus[Math.floor(Math.random() * skus.length)],
      i % 2 === 0 ? camp1.lastInsertRowid : camp2.lastInsertRowid,
      createdAt
    );
  }

  // Seed Alerts
  db.prepare("INSERT INTO alerts (user_id, severity, title, description, action) VALUES (?, ?, ?, ?, ?)")
    .run(userId, "High", "RTO Spike Detected", "RTO rate in North region (Pincode 110001) increased by 25% in the last 24 hours.", "Disable COD for North region temporarily.");

  res.json({ message: "Data seeded successfully" });
});

app.get("/api/analysis/rto", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  
  const regions = db.prepare(`
    SELECT 
      region,
      COUNT(id) as total_orders,
      SUM(CASE WHEN status = 'RTO' THEN 1 ELSE 0 END) as rto_count,
      SUM(CASE WHEN status = 'RTO' THEN rto_cost ELSE 0 END) as rto_loss,
      SUM(revenue) as revenue
    FROM orders 
    WHERE user_id = ?
    GROUP BY region
    ORDER BY rto_count DESC
  `).all(userId);

  const pincodes = db.prepare(`
    SELECT 
      pincode,
      region,
      COUNT(id) as total_orders,
      SUM(CASE WHEN status = 'RTO' THEN 1 ELSE 0 END) as rto_count,
      SUM(CASE WHEN status = 'RTO' THEN rto_cost ELSE 0 END) as rto_loss
    FROM orders 
    WHERE user_id = ?
    GROUP BY pincode
    ORDER BY rto_count DESC
    LIMIT 10
  `).all(userId);

  const skus = db.prepare(`
    SELECT 
      sku,
      COUNT(id) as total_orders,
      SUM(CASE WHEN status = 'RTO' THEN 1 ELSE 0 END) as rto_count,
      SUM(CASE WHEN status = 'RTO' THEN rto_cost ELSE 0 END) as rto_loss
    FROM orders 
    WHERE user_id = ?
    GROUP BY sku
    ORDER BY rto_loss DESC
  `).all(userId);

  const blockedPincodes = db.prepare(`
    SELECT * FROM blocked_pincodes WHERE user_id = ?
  `).all(userId);

  const blockedSkus = db.prepare(`
    SELECT * FROM blocked_skus WHERE user_id = ?
  `).all(userId);

  res.json({ regions, pincodes, skus, blockedPincodes, blockedSkus });
});

app.post("/api/skus/block", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const { sku, reason } = req.body;
  
  // Check if already blocked
  const existing = db.prepare("SELECT id FROM blocked_skus WHERE user_id = ? AND sku = ?").get(userId, sku);
  
  if (!existing) {
    db.prepare("INSERT INTO blocked_skus (user_id, sku, reason) VALUES (?, ?, ?)").run(userId, sku, reason || 'High RTO Rate');
  }
  
  res.json({ success: true });
});

app.post("/api/skus/unblock", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const { sku } = req.body;
  
  db.prepare("DELETE FROM blocked_skus WHERE user_id = ? AND sku = ?").run(userId, sku);
  res.json({ success: true });
});

app.post("/api/pincodes/block", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const { pincode, reason } = req.body;
  
  // Check if already blocked
  const existing = db.prepare("SELECT id FROM blocked_pincodes WHERE user_id = ? AND pincode = ?").get(userId, pincode);
  
  if (!existing) {
    db.prepare("INSERT INTO blocked_pincodes (user_id, pincode, reason) VALUES (?, ?, ?)").run(userId, pincode, reason || 'High RTO Rate');
  }
  
  res.json({ success: true });
});

app.post("/api/pincodes/unblock", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const { pincode } = req.body;
  
  db.prepare("DELETE FROM blocked_pincodes WHERE user_id = ? AND pincode = ?").run(userId, pincode);
  res.json({ success: true });
});

app.get("/api/ai/raw-data", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  
  const dailyMetrics = db.prepare(`
    SELECT 
      DATE(created_at) as date,
      SUM(revenue) as revenue,
      SUM(revenue - (cogs + shipping_cost + rto_cost + gateway_fee + packaging_cost + discount)) as profit,
      COUNT(id) as total_orders,
      SUM(CASE WHEN status = 'RTO' THEN 1 ELSE 0 END) as rto_count
    FROM orders
    WHERE user_id = ?
    GROUP BY DATE(created_at)
    ORDER BY date ASC
    LIMIT 30
  `).all(userId);

  const regionPerformance = db.prepare(`
    SELECT 
      region,
      COUNT(id) as orders,
      SUM(CASE WHEN status = 'RTO' THEN 1 ELSE 0 END) as rto_count
    FROM orders
    WHERE user_id = ?
    GROUP BY region
  `).all(userId);

  res.json({ dailyMetrics, regionPerformance });
});

app.get("/api/analysis/skus", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const skus = db.prepare(`
    SELECT 
      sku,
      COUNT(id) as order_count,
      SUM(revenue) as revenue,
      SUM(cogs) as total_cogs,
      SUM(shipping_cost + rto_cost + gateway_fee + packaging_cost) as total_ops_cost,
      SUM(revenue - (cogs + shipping_cost + rto_cost + gateway_fee + packaging_cost + discount)) as net_profit
    FROM orders
    WHERE user_id = ?
    GROUP BY sku
    ORDER BY net_profit DESC
  `).all(userId);
  res.json(skus);
});

app.get("/api/settings", authenticateToken, (req: any, res) => {
  const user = db.prepare("SELECT email, business_name, created_at FROM users WHERE id = ?").get(req.user.id);
  res.json(user);
});

app.post("/api/settings", authenticateToken, (req: any, res) => {
  const { business_name } = req.body;
  db.prepare("UPDATE users SET business_name = ? WHERE id = ?").run(business_name, req.user.id);
  res.json({ message: "Settings updated" });
});

app.get("/api/orders/detailed", authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const orders = db.prepare(`
    SELECT 
      o.*,
      c.name as campaign_name,
      (o.revenue - (o.cogs + o.shipping_cost + o.rto_cost + o.gateway_fee + o.packaging_cost + o.discount)) as profit
    FROM orders o
    LEFT JOIN campaigns c ON o.campaign_id = c.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(userId);
  res.json(orders);
});

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
