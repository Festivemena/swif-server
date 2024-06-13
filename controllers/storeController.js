const Store = require('../models/Store');

exports.getStores = async (req, res) => {
  const stores = await Store.find({});
  res.json(stores);
};

exports.getStoreById = async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (store) {
    res.json(store);
  } else {
    res.status(404).json({ message: 'Store not found' });
  }
};

exports.createStore = async (req, res) => {
  const { name, description } = req.body;
  const store = new Store({
    name,
    description,
    owner: req.user._id,
  });

  const createdStore = await store.save();
  res.status(201).json(createdStore);
};
