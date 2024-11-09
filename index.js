require('dotenv').config()
const mysql = require('mysql');
const exp = require('express');
const app = exp();

const fs = require('fs');
var cors = require('cors');


app.use([cors(), exp.json()]);


//connect database
const db = mysql.createConnection({
    host:"brsll9pzggpnsutvatew-mysql.services.clever-cloud.com",
    user:'ujx3uf4jpgubkpjb',
    password: 'lkTlmzspOfB3FablxFLn',
    database:  'brsll9pzggpnsutvatew'
    // host:process.env.HOST_NAME,
    // user: process.env.USER,
    // password: process.env.PASSWORD,
    // database: process.env.DATABASE
})
db.connect(err=>{
    if(err) throw err;
    console.log("Đã kết nối database");
})

//lấy tất cả Homestay
app.get('/homestay', function(req, res){
    let sql = `SELECT * FROM homestay`
    db.query (sql, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗi lấy list homestay", err});
        else res.json(data);
    })
})

//lấy tất cả loại Homestay
app.get('/loaihomestay', function(req, res){
    let sql = `SELECT * FROM loai_homestay`
    db.query (sql, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗi lấy list homestay", err});
        else res.json(data);
    })
})

//lấy theo loại homestay
app.get('/loaihomestay', function(req, res){
    let id_loai = parseInt(req.params.id_loai)
    if (isNaN(id_loai) || id_loai <= 0) {
        res.json({"thongbao":"Không biết loại", "id_loai": id_loai}); return;
    }
    let sql = `SELECT * FROM loai_homestay WHERE id_Loai =?`
    db.query(sql, id_loai, (err, data)=>{
        if(err) res.json({"thongbao":"Lỗi lấy  loai", err});
        else res.json(data[0]);
    })
})

// Lấy danh sách homestay theo loại
app.get('/homestay/:id_loai', function(req, res) {
    let id_loai = parseInt(req.params.id_loai);
    
    // Kiểm tra id_loai hợp lệ
    if (isNaN(id_loai) || id_loai <= 0) {
        res.json({ "thongbao": "Không biết loại", "id_loai": id_loai });
        return;
    }

    // Truy vấn lấy danh sách homestay theo id_loai
    let sql = `SELECT * FROM homestay WHERE id_loai = ?`;
    db.query(sql, id_loai, (err, data) => {
        if (err) {
            res.json({ "thongbao": "Lỗi lấy danh sách homestay", err });
        } else if (data.length === 0) {
            res.json({ "thongbao": "Không tìm thấy homestay nào cho loại này" });
        } else {
            res.json(data); // Trả về danh sách homestay
        }
    });
});


// API lấy danh sách homestay liên quan
app.get("/homestaylienquan/:id", function (req, res) {
    let id = parseInt(req.params.id || 0);
    if (isNaN(id) || id <= 0) {
      res.json({ "thong bao": "Không biết homestay", id: id });
      return;
    }
    let sql = `SELECT * FROM homestay, hinh_homestay, hinh_anh
     WHERE id_Loai = ? AND homestay.id_homestay = hinh_homestay.id_homestay 
    AND hinh_homestay.id_hinh = hinh_anh.id_hinh ORDER BY homestay.id_homestay desc LIMIT 4`;
    db.query(sql, id, (err, data) => {
      if (err) res.json({ thongbao: "Lỗi lấy homestay", err });
      else res.json(data);  // Trả về toàn bộ danh sách homestay
    });
  });
  

// API lấy danh sách hình ảnh của homestay
app.get('/dshinhanh', (req, res) => {
    const id_homestay = req.params.id;

    const query = `
    SELECT *
    FROM homestay, hinh_homestay, hinh_anh
    WHERE homestay.id_homestay = hinh_homestay.id_homestay 
    AND hinh_homestay.id_hinh = hinh_anh.id_hinh
    `;
    db.query(query, [id_homestay], (err, results) => {
        if (err) {
            console.error('Error fetching images:', err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});

// ct homestay
app.get('/ct_homestay/:id', (req, res) => {
    let id = parseInt(req.params.id || 0);
    if (isNaN(id) || id <= 0) {
        res.json({ "thong bao": "Không biết homestay", id: id });
        return;
    }
    console.log('Request homestay ID:', id);    
    let sql = 
    `SELECT * FROM homestay, hinh_homestay, hinh_anh 
    WHERE homestay.id_homestay = ? AND homestay.id_homestay = hinh_homestay.id_homestay 
    AND hinh_homestay.id_hinh = hinh_anh.id_hinh
    `;
    db.query(sql, [id], (err, rows) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ message: 'Internal server error' });
        } else if (rows.length > 0) {
            res.json(rows[0]); // Trả về homestay đầu tiên
        } else {
            res.status(404).json({ message: 'Homestay not found' });
        }
    });
});

// show homestay trong admin
app.get('/admin/sp', function (req, res){
    let sql = `SELECT id, ten_sp, gia, hinh, ngay, luot_xem FROM san_pham ORDER BY id desc `
    db.query (sql, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗi lấy list sp", err});
        else res.json(data);
    })
})
// show loại homestay trong admin
app.get('/admin/loai', function (req, res){
    let sql = `SELECT id, ten_loai, thu_tu, an_hien FROM loai`
    db.query (sql, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗi lấy list sp", err});
        else res.json(data);
    })
})
//định nghĩa route lấy chi tiết 1 homestay trong admin
app.get('/admin/sp/:id', function (req, res) {
    let id = parseInt(req.params.id);
    if (id <= 0){
        res.json({"thongbao":"Không tìm thấy sản phẩm", "id": id}); return;
    }
    let sql = `SELECT * FROM san_pham WHERE id = ?`
    db.query(sql, id, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗi lấy 1 sp", err});
        else res.json(data[0]);
    })
})
//định nghĩa route lấy chi tiết 1 loại homestay trong admin
app.get('/admin/loai/:id', function (req, res) {
    let id = parseInt(req.params.id);
    if (id <= 0){
        res.json({"thongbao":"Không tìm thấy sản phẩm", "id": id}); return;
    }
    let sql = `SELECT * FROM loai WHERE id = ?`
    db.query(sql, id, (err, data) =>{
        if(err) res.json({"thongbao":"Lỗi lấy 1 sp", err});
        else res.json(data[0]);
    })
})

//định nghĩa route thêm sản phẩm
app.post('/admin/sp', function (req, res){
    let data = req.body;
    let sql = `INSERT INTO san_pham SET?`
    db.query(sql, data, (err, data) => {
        if(err) 
            res.json({"thongbao": "Lỗi thêm sản phẩm", err});
        else 
            res.json({"thongbao":"Đã thêm sản phẩm thành công", "id_sp": data.insertId});
    })
})

//định nghĩa route sửa sản phẩm
app.put('/admin/sp/:id', function (req, res){
    let id = req.params.id;
    let data = req.body;
    let sql = `UPDATE san_pham SET? WHERE id =?`
    db.query(sql, [data, id], (err, d) => {
        if(err) 
            res.json({"thongbao": "Lỗi sửa sản phẩm", err});
        else 
            res.json({"thongbao":"Đã sửa sản phẩm thành công"});
    })
})

//định nghĩa route xóa sản phẩm
app.delete('/admin/sp/:id', function (req, res){
    let id = req.params.id;
    let sql = `DELETE FROM san_pham WHERE id =?`
    db.query(sql, id, (err, d) => {
        if(err) 
            res.json({"thongbao": "Lỗi xóa sản phẩm", err});
        else 
            res.json({"thongbao":"Đã xóa sản phẩm thành công"});
    })
})

//Định nghĩa route thêm loại
app.post('/admin/loai', function (req, res){
    let data = req.body;
    let sql = `INSERT INTO loai SET?`
    db.query(sql, data, (err, data) => {
        if(err) 
            res.json({"thongbao": "Lỗi thêm sản phẩm", err});
        else 
            res.json({"thongbao":"Đã thêm sản phẩm thành công", "id_sp": data.insertId});
    })
})

//định nghĩa route sửa loại homestay
app.put('/admin/loai/:id', function (req, res){
    let id = req.params.id;
    let data = req.body;
    let sql = `UPDATE loai SET? WHERE id =?`
    db.query(sql, [data, id], (err, d) => {
        if(err) 
            res.json({"thongbao": "Lỗi sửa sản phẩm", err});
        else 
            res.json({"thongbao":"Đã sửa sản phẩm thành công"});
    })
})

//định nghĩa route xóa loại homestay
app.delete('/admin/loai/:id', function (req, res){
    let id = req.params.id;
    let sql = `DELETE FROM loai WHERE id =?`
    db.query(sql, id, (err, d) => {
        if(err) 
            res.json({"thongbao": "Lỗi xóa sản phẩm", err});
        else 
            res.json({"thongbao":"Đã xóa sản phẩm thành công"});
    })
})

// const  PRIVATE_KEY =  fs.readFileSync("private-key.txt")
// // đăng ký
// app.post('/dangky', function (req, res){
//     let data = req.body;
//     let sql = `INSERT INTO users  SET?`
//     db.query(sql, data, (err, data) => {
//         if(err) 
//             res.json({"thongbao": "Lỗi đăng ký", err});
//         else 
//             res.json({"thongbao":"Đã đăng ký thành công", "id": data.insertId});
//     })
// })
// //authen login
// app.post('/login', function(req, res) {
//     const em = req.body.em
//     const pw = req.body.pw
//     checkUserPass(em, pw, (err, user) =>{
//     if (err) {
//         return res.status(500).json({ error: "Đã xảy ra lỗi khi kiểm tra thông tin người dùng." ,err});
//     }

//     if (user) {
//         // Người dùng hợp lệ, tiếp tục xử lý và tạo JWT token
//         const userInfo = { id: user.id, email: user.email, name:user.name }; // Thay đổi theo cấu trúc thông tin người dùng
//         const jwtBearToken = jwt.sign({}, PRIVATE_KEY, { algorithm: "RS256", expiresIn: 120, subject: userInfo.id.toString() });
//         return res.json({ token: jwtBearToken, expiresIn: 120, userInfo: userInfo });
//     } else {
//         return res.status(401).json({ "thông báo": "Thông tin đăng nhập không hợp lệ." });
//     }
// })
// })
// const checkUserPass = (em, pw, callback) => {
//     let sql = `SELECT * FROM users WHERE email = "${em}"  AND password = "${pw}"`
//     db.query(sql, (err, data) => {
//         if(err){ 
//             callback(err, null);
//         }else{
//             if(data.length > 0){
//                 callback(null, data[0])
//             }else{
//                 callback(null, null)
//             }
//         }
    
//     })
// }

app.listen(3000, () => console.log("ung dung chay voi port 3000"))