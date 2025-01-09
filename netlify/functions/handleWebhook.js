const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 定义最大评论数量和存储文件路径
const MAX_COMMENTS = 20;
const COMMENTS_FILE = path.resolve(__dirname, 'comments.json');

exports.handler = async (event) => {
    // 检查是否为 POST 请求
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    // 验证 HMAC 签名
    const secret = 'your_uplink_auth_key'; // 替换为你的密钥
    const signature = event.headers['authorization']?.split('=')[1];
    const calculatedSignature = crypto
        .createHmac('sha1', secret)
        .update(event.body)
        .digest('base64');

    if (signature !== calculatedSignature) {
        return {
            statusCode: 403,
            body: 'Invalid signature',
        };
    }

    // 获取新的评论数据
    const newComment = JSON.parse(event.body);

    // 读取现有评论
    let existingComments = [];
    if (fs.existsSync(COMMENTS_FILE)) {
        existingComments = JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8'));
    }

    // 添加新评论并限制最大数量
    existingComments.push(newComment);
    if (existingComments.length > MAX_COMMENTS) {
        existingComments.shift(); // 移除最老的评论
    }

    // 保存评论到文件
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(existingComments, null, 2));

    // 返回成功响应
    return {
        statusCode: 200,
        body: 'Comment received',
    };
};
