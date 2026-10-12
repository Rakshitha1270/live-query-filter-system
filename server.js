const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const products = [
  {id:1,name:"Laptop Pro 14",category:"Electronics",description:"Powerful laptop for work and study."},
  {id:2,name:"Wireless Headphones",category:"Electronics",description:"Comfortable headphones with clear sound."},
  {id:3,name:"Smart Watch",category:"Electronics",description:"Fitness and notification tracking."},
  {id:4,name:"Python Programming",category:"Books",description:"Beginner-friendly Python programming book."},
  {id:5,name:"Web Development Guide",category:"Books",description:"HTML CSS and JavaScript learning guide."},
  {id:6,name:"JavaScript Essentials",category:"Books",description:"Practical JavaScript learning resource."},
  {id:7,name:"Office Backpack",category:"Accessories",description:"Durable backpack for laptop and accessories."},
  {id:8,name:"USB-C Hub",category:"Accessories",description:"Multi-port USB-C connectivity hub."},
  {id:9,name:"Mechanical Keyboard",category:"Accessories",description:"Responsive keyboard for developers."},
  {id:10,name:"Running Shoes",category:"Sports",description:"Lightweight shoes for daily running."},
  {id:11,name:"Yoga Mat",category:"Sports",description:"Non-slip mat for yoga and exercise."},
  {id:12,name:"Football",category:"Sports",description:"Training football for outdoor play."},
  {id:13,name:"Coffee Maker",category:"Home",description:"Compact coffee maker for home use."},
  {id:14,name:"Desk Lamp",category:"Home",description:"Adjustable lamp for study desks."},
  {id:15,name:"Water Bottle",category:"Home",description:"Reusable insulated water bottle."}
];

app.get("/api/categories", (req, res) => {
  res.json([...new Set(products.map(p => p.category))]);
});

app.get("/api/suggestions", (req, res) => {
  const q = String(req.query.q || "").toLowerCase().trim();
  const list = products
    .filter(p => !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q))
    .slice(0, 8)
    .map(p => p.name);
  res.json(list);
});

app.get("/api/search", (req, res) => {
  const search = String(req.query.search || "").toLowerCase().trim();
  const category = String(req.query.category || "");
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 20);

  const filtered = products.filter(p =>
    (!search ||
      p.name.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)) &&
    (!category || p.category === category)
  );

  const total = filtered.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;

  res.json({
    data: filtered.slice(start, start + limit),
    total,
    page: safePage,
    totalPages
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
