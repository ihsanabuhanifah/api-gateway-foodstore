const Category = require("./model");
async function index(req, res, next) {
 
  try {
    let { limit = 2, skip = 0 } = req.query;
    let category = await Category.find().limit(parseFloat(limit)).skip(parseFloat(skip));
    
    return res.json({
      message: "success",
      pagination: {
        perpage: limit,
        total_data: category.length,
      },
      data: category,
    });
  } catch (err) {
    next(err);
  }
}
async function store(req, res, next) {
  try {
    let payload = req.body;

    let category = new Category(payload);

    await category.save();

    return res.json({
      status: "success",
      message: "berhasil membuat kategori",
      data: category,
    });
  } catch (err) {
    // (1) tangani error yang disebabkan oleh validasi model
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // (2) tangani error yang tidak kita ketahui
    next(err);
  }
}

async function update(req, res, next) {
  try {
    let payload = req.body;

    let category = await Category.findOneAndUpdate(
      { _id: req.params.id },
      payload,
      { new: true, runValidators: true }
    );

    return res.json({
      status: "success",
      message: "nama kategori berhasil di update",
      data: category,
    });
  } catch (err) {
    // (1) tangani error yang disebabkan oleh validasi model
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    // (2) tangani error yang tidak kita ketahui
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    let deleteCategory = await Category.findOneAndDelete({
      _id: req.params.id,
    });
    return res.json({
      status: "success",
      message: "Kategori berhasil di hapus",
    });
  } catch (err) {
    next(err);
  }
}
module.exports = { store, update, destroy , index };
