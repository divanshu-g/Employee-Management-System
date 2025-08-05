const app = require('./app');

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({ message: 'Server error', error: err.message });
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
