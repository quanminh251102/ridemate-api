const { Router } = require("express");
const userController = require("../controllers/user");
const adminUserController = require("../controllers/admin/user");
const router = Router();

//admin
router.post("/admin", adminUserController.create);
router.patch("/admin/:id", adminUserController.update);
router.get("/admin/:id", adminUserController.getOne);
router.get("/admin", adminUserController.getList);
router.delete("/admin/:id", adminUserController.delete);

//user
router.get("/profile", userController.getInfo);
router.patch("/profile", userController.updateInfo);
router.patch("/:id", userController.update);
router.get("/:id", userController.getOne);

module.exports = router;

