const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

module.exports.imageResizer = (req, res, next) => {
    if (req.file) {
        try {
            let newfile = req.body.itemName.toLowerCase().replace(/ /, '-') + path.extname(req.file.originalname);
            sharp(req.file.path).resize(250, 250).toFile('public/images/' + newfile, (err, resizeImage) => {
                if (err) {
                    console.log(err);
                }
            })
        } catch (error) {
            console.log(error);
        }
    }
    next();
};

module.exports.sendgridTemplate = (info) => {
    const { userfname, userlname, userId, cart, carttotal } = info;
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + ' ' + time;

    let body = '';
    cart.forEach(item => {
        body += `<tr>
                <td><img src="https://cafe-s.herokuapp.com/images/${item.itemImg}" alt="${item.itemName}" style="width: 50px; height: 50px;"></td>
                <td>${item.itemName}</td>
                <td>${item.itemQty}</td>
                <td>$${item.itemPrice}</td>
                <td>$${item.itemTotal}</td>
            </tr>`;
    });

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>   
        <body>
        <div style="text-align: center; font-weight: bold;">THANK YOU FOR SHOPPING WITH US TODAY.</div>
        <div style="text-align: center; font-weight: bold;">Sale Receipt</div>
        <div style="text-align: center; font-style: italic;">${dateTime}</div>
        <div><span style="font-weight: bold;">Customer: </span>${userfname} ${userlname}</div>
        <div><span style="font-weight: bold;">Email: </span>${userId}</div>
            <h3>This is your shopping cart</h3>
                <hr>
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 5rem; text-align: left;">Image</th>
                                <th style="width: 10rem; text-align: left;">Name</th>
                                <th style="width: 7rem; text-align: left;">Qty</th>
                                <th style="width: 7rem; text-align: left;">Unit Price</th>
                                <th style="width: 7rem; text-align: left;">Line Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${body}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" style="text-align: right; font-weight: bold">Your total is (tax-excluded):</td>
                                <td style="font-weight: bold">$${carttotal}</td>
                            </tr>
                        </tfoot>
                    </table>
        </body>
        </html>`;
}



