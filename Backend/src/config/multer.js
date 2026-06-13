const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // or use cloudinary/s3 storage

router.post("/products", upload.array("images", 3), async (req, res) => {
  const imageUrls = req.files.map((f) => `/uploads/${f.filename}`); // or cloud URLs

  const product = new Product({
    ...req.body,
    colors: JSON.parse(req.body.colors),
    images: imageUrls,        // ← saved as array on the product
  });

  await product.save();
  res.json(product);
});