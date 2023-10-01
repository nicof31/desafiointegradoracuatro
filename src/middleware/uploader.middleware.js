import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

ensureDirectoryExists(`${__dirname}/../public/files/images/profile`);
ensureDirectoryExists(`${__dirname}/../public/files/images/products`);
ensureDirectoryExists(`${__dirname}/../public/files/documents/pdf`);
ensureDirectoryExists(`${__dirname}/../public/files/documents/identificacion`);
ensureDirectoryExists(`${__dirname}/../public/files/documents/domicilio`);
ensureDirectoryExists(`${__dirname}/../public/files/documents/estadodecuenta`);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let route = 'documents';
    if (file.fieldname === 'profileImage') route = 'images/profile';
    if (file.fieldname === 'productImage') route = 'images/products';
    if (file.fieldname === 'document') route = 'documents/pdf';
    if (file.fieldname === 'documentIdentificacion') route = 'documents/identificacion';
    if (file.fieldname === 'documentDomicilio') route = 'documents/domicilio';
    if (file.fieldname === 'documentEstadodecuenta') route = 'documents/estadodecuenta';

    cb(null, `${__dirname}/../public/files/${route}`);
  },
  filename: function (req, file, cb) {
    let filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const uploader = multer({
  storage: storage,
  fields: [
    { name: 'profileImage', maxCount: 1 },
    { name: 'productImage', maxCount: 1 },
    { name: 'document', maxCount: 10 },
    { name: 'documentIdentification', maxCount: 2 },
    { name: 'documentDomicilio', maxCount: 1 },
    { name: 'documentEstadodecuenta', maxCount: 1 }
  ]
});

export { uploader };
