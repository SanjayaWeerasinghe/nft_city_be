const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: { type: Number, default: 1 }
});

const CounterModel = mongoose.model('Counter', CounterSchema);
module.exports = CounterModel;
