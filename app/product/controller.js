// file `app/product/controller.js`

const fs = require("fs");
const path = require("path");

const Product = require("./model");
const config = require("../config");

async function store(req, res, next) {
  try {
    let payload = req.body;

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt =
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ];
      let filename = req.file.filename + "." + originalExt;
      let target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = new Product({ ...payload, image_url: filename });
          await product.save();
          return res.json(product);
        } catch (err) {
          // (1) jika error, hapus file yang sudah terupload pada direktori
          fs.unlinkSync(target_path);

          // (2) cek apakah error disebabkan validasi MongoDB
          if (err && err.name === "ValidationError") {
            return res.json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }

          next(err);
        }
      });

      src.on("error", async () => {
        next(err);
      });
    } else {
      let product = new Product(payload);
      await product.save();
      return res.json(product);
    }
  } catch (err) {
    // ----- cek tipe error ---- //
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err);
  }
}

//end point daftar product

async function index(req, res, next) {
  try {
    let { limit = 2, skip = 0 } = req.query;
    let products = await Product.find()
      .limit(parseFloat(limit))
      .skip(parseFloat(skip));
    return res.json({
      message: "success",
      pagination: {
        perpage: limit,
        total_data: products.length,
      },
      data: products,
    });
  } catch (err) {
    next(err);
  }
}

//update

async function update(req, res, next) {
  try {
    let payload = req.body;

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt =
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ];
      let filename = req.file.filename + "." + originalExt;
      let target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = await Product.findOne({ _id: req.params.id });

          let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

          if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage);
          }

          product = await Product.findOneAndUpdate(
            { _id: req.params.id },
            { ...payload, name: payload.name,  image_url: filename },
            { new: true, runValidators: true }
          );

          return res.json(product);
        } catch (err) {
          // ----- cek tipe error ---- //
          if (err && err.name === "ValidationError") {
            return res.json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }

          next(err);
        }
      });

      src.on("error", async () => {
        next(err);
      });
    } else {
      // (6) update produk jika tidak ada file upload
      let product = await Product.findOneAndUpdate(
        { _id: req.params.id },
        payload,
        { new: true, runValidators: true }
      );

      return res.json(product);
    }
  } catch (err) {
    // ----- cek tipe error ---- //
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err);
  }
}

//delete

async function destroy(req, res, next) {
  try {
    let product = await Product.findOneAndDelete({ _id: req.params.id });

    if (product === null) {
      return res.json({
        status: "fail",
        message: "Product tidak ditemukan",
      });
    } else {
      let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }

      return res.json({
        message: "Data Berhasil di hapus",
      });
    }
  } catch (err) {
    next(err);
  }
}

//get Detail

async function detail(req, res, next) {
  try {
    let product = await Product.findOne({ _id: req.params.id });

    if (product === null) {
      return res.json({
        status: "fail",
        message: "Product tidak ditemukan",
      });
    } else {
      let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }

      return res.json({
        status: "success",
        message: "Product berhasil ditemukan",
        data: product,
      });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  store,
  detail,
  index,
  update,
  destroy,
};
