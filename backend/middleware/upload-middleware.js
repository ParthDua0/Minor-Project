
const multer=require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '..', 'uploads')

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname).toLowerCase())
    }
})
const upload = multer({
     storage: storage,
    limits:{
        fileSize:10*1024*1024
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ]

        if (allowedTypes.includes(file.mimetype)) {
            return cb(null, true)
        }

        cb(new Error('Only PDF, DOCX, and TXT resume files are allowed'))
    }
    })

module.exports = upload
