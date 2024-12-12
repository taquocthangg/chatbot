const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../models');
const { OpenAI } = require('openai');

// Cấu hình OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const getInformationByUrl = async (req, res) => {
    const { url } = req.body; // Lấy URL từ request body

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Gửi request GET đến URL
        const result = await axios.get(url);

        // Load HTML bằng cheerio
        const $ = cheerio.load(result.data);
        $('script, style').remove(); // Loại bỏ các thẻ không cần thiết

        // Lấy nội dung văn bản từ body
        let text = $('body').text();

        // Xử lý văn bản
        text = text.replace(/(\r\n|\n|\r|\t)/gm, ' '); // Xóa các ký tự không cần thiết
        text = text.replace(/\s\s+/g, ' '); // Thay thế khoảng trắng dài bằng một khoảng trắng
        text = text.trim(); // Loại bỏ khoảng trắng ở đầu và cuối

        // Gửi dữ liệu thô tới OpenAI để tóm tắt
        const prompt = `Tôi có một dữ liệu thô được crawl từ một website, tôi cần tổng hợp nội dung để làm dữ liệu cho bot trả lời. Hãy thu thập nội dung càng chi tiết càng tốt. Nội dung: ${text}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Bạn là một trợ lý AI chuyên tóm tắt dữ liệu từ văn bản.' },
                { role: 'user', content: prompt },
            ],
        });

        // Lấy dữ liệu tóm tắt từ OpenAI
        const summary = response.choices[0]?.message?.content || 'Không thể tóm tắt nội dung.';

        // Lưu dữ liệu tóm tắt vào database
        const savedData = await db.MedicalData.create({
            type: 'url',
            content: summary,
            url:url
        });

        // Trả về dữ liệu đã lưu
        return res.status(201).json({
            message: 'Data crawled, summarized, and saved successfully',
            data: savedData,
        });
    } catch (error) {
        console.error('Error while crawling and summarizing data from URL:', error);
        return res.status(500).json({ error: 'Failed to crawl and summarize data from URL' });
    }
};

module.exports = { getInformationByUrl };
