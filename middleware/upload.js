const multer = require('multer');

// Custom Storage Engine untuk mengubah file langsung menjadi Base64 Data URL
class Base64Storage {
    _handleFile(req, file, cb) {
        let chunks = [];
        file.stream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        file.stream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const b64 = buffer.toString('base64');
            const dataUrl = `data:${file.mimetype};base64,${b64}`;
            
            cb(null, {
                path: dataUrl,
                size: buffer.length
            });
        });
        file.stream.on('error', (err) => {
            cb(err);
        });
    }

    _removeFile(req, file, cb) {
        cb(null);
    }
}

const storage = new Base64Storage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Batas ukuran file 5MB
});

module.exports = upload;