const { Router } = require('express')
const { uploadImage } = require('../controllers/upload')
const { upload } = require('../service/upload')

const router = Router()

router.post('/', upload.single('image'), uploadImage)

module.exports = router