const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

// Đường dẫn tới tệp ZIP
const zipFilePath = path.join(__dirname, 'Fca-Horizon-Remastered-main.zip'); // Thay 'yourfile.zip' bằng tên tệp zip của bạn

// Thư mục đích sau khi giải nén
const outputDir = path.join(__dirname, 'hzi');

// Kiểm tra nếu thư mục đích không tồn tại, thì tạo mới
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Khởi tạo đối tượng AdmZip và giải nén
const zip = new AdmZip(zipFilePath);
zip.extractAllTo(outputDir, true);

console.log(`Đã giải nén tệp zip vào thư mục: ${outputDir}`);
