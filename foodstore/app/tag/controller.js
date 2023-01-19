const { policyFor } = require("../policy");
const Tag = require("./model");

async function store(req, res, next) {
  try {
    /* cek policy */
    let policy = policyFor(req.user);
    if (!policy.can("create", "Tag")) {
      return res.json({
        error: 1,
        message: "Anda tidak memiliki akses untuk membuat Tag",
      });
    }

    let payload = req.body;
    let tag = new Tag(payload);

    await tag.save();
    return res.json(tag);
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }
    next(error);
  }
}

async function update(req, res, next) {
  try {
    /* cek policy */
    let policy = policyFor(req.user);
    if (!policy.can("update", "Tag")) {
      return res.json({
        error: 1,
        message: "Anda tidak memiliki akses untuk mengupdate Tag",
      });
    }

    let payload = req.body;
    let tag = await Tag.findOneAndUpdate({ _id: req.params.id }, payload, {
      new: true,
      runValidators: true,
    });
    return res.json(tag);
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    /* cek policy */
    let policy = policyFor(req.user);
    if (!policy.can("delete", "Tag")) {
      return res.json({
        error: 1,
        message: "Anda tidak memiliki akses untuk menghapus Tag",
      });
    }

    let tag = await Tag.findOneAndDelete({ _id: req.params.id });
    return res.json(tag);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  store,
  update,
  destroy,
};
