import db from '../models';
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const askChatGPT = async (req, res) => {
    const { id } = req.user;
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Missing question in request body' });
    }

    try {
        // Lấy thông tin người dùng
        const user = await db.User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Lấy tất cả dữ liệu y tế
        const MedicalData = await db.MedicalData.findAll();
        const medicalContent = MedicalData?.map(data => `- ${data.content}`).join('\n');

        // Truy xuất lịch sử trò chuyện của người dùng
        const chatHistory = await db.ChatHistory.findAll({
            where: { userId: user.id },
            attributes: ['question', 'response'],
            order: [['createdAt', 'ASC']], // Sắp xếp theo thời gian
        });

        // Xây dựng prompt khởi tạo
        const messages = [
            { role: 'system', content: 'Bạn là một trợ lý y khoa tên HopitechAI, có kiến thức sâu rộng về các vấn đề y tế. Nhiệm vụ của bạn là cung cấp các câu trả lời chính xác và hữu ích dựa trên dữ liệu y tế được cung cấp.' },
            { role: 'system', content: `Dữ liệu y tế hiện có để tham khảo:\n${medicalContent || 'Không có dữ liệu y tế hiện tại.'}` },
        ];

        // Thêm lịch sử trò chuyện vào prompt
        chatHistory.forEach(entry => {
            messages.push({ role: 'user', content: entry.question });
            messages.push({ role: 'assistant', content: entry.response });
        });

        // Thêm câu hỏi hiện tại của người dùng
        messages.push({ role: 'user', content: question });

        // Gửi câu hỏi tới OpenAI API
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
        });

        // Lấy câu trả lời từ OpenAI
        const answer = response.choices && response.choices[0].message ? response.choices[0].message.content : 'No answer from AI';

        // Lưu câu hỏi và câu trả lời vào lịch sử trò chuyện
        await db.ChatHistory.create({
            userId: user.id,
            question: question,
            response: answer,
        });

        // Gửi phản hồi cho người dùng
        res.json({
            question,
            answer,
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
};

module.exports = { askChatGPT };
