const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

exports.createProduct = async (req, res) => {
  const { name, description, price, brand, category, countInStock, store } = req.body;

  const product = new Product({
    name,
    description,
    price,
    brand,
    category,
    countInStock,
    store,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};
