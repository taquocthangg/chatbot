import db from '../models';
import bcrypt from 'bcryptjs'


export const getUserInfo = async (req, res) => {
    const { id } = req.user;
    try {
        const user = await db.User.findByPk(id,
            {
                attributes: ['name', 'email', 'role'],
            });

        if (!user) {
            return res.status(400).json({ err: 1, mess: "Tài khoản chưa được đăng ký" });
        }
        res.json({ err: 0, mess: "Lấy thông tin thành công", data: user });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ err: 1, mess: "Lỗi không xác định" });
    }
};
export const updateUser = async (req, res) => {
    const { id } = req.user;
    const { name, password } = req.body;

    const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(9))

    const updateFields = {};
    if (name) updateFields.name = name;
    if (password) updateFields.password = hashPassword(password);

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ err: 1, mess: "Không có trường nào để cập nhật" });
    }

    try {
        const user = await db.User.findByPk(id);

        if (!user) {
            return res.status(404).json({ err: 1, mess: "Người dùng không tồn tại" });
        }

        await user.update(updateFields);

        res.json({
            err: 0,
            mess: "Cập nhật thông tin thành công",
            data: {
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ err: 1, mess: "Lỗi không xác định khi cập nhật thông tin" });
    }
};


export const chatHistory = async (req, res) => {

    const userId = req.user.id
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {

        const chatHistory = await db.ChatHistory.findAll({
            where: { userId },
            attributes: ['question', 'response'],
            order: [['createdAt', 'ASC']],
        });

        res.json(chatHistory);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'An error occurred while fetching the chat history' });
    }
};

export const getDataTrained = async (req, res) => {
    try {
        const medicalData = await db.MedicalData.findAll({ attributes: ['type', 'content'], });
        res.json(medicalData);
    } catch (error) {
        console.error('Error fetching medical data:', error);
        res.status(500).json({ error: 'An error occurred while fetching the medical data' });
    }
};

export const addData = async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Missing type or content in request body' });
    }

    try {
        const newMedicalData = await db.MedicalData.create({
            type: 'text',
            content: content,
        });
        res.status(201).json({
            err: 0,
            mess: 'Medical data added successfully',
            data: newMedicalData,
        });
    } catch (error) {
        console.error('Error adding medical data:', error);
        res.status(500).json({ err: 1, mess: 'An error occurred while adding the medical data' });
    }
};


export const updateData = async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ err: 1, mess: 'Missing content in request body' });
    }

    try {
        // Tìm bản ghi mới nhất
        let latestData = await db.MedicalData.findOne({
            where: { type: 'text' },
            order: [['createdAt', 'DESC']],
        });

        if (!latestData) {
            // Nếu không có bản ghi nào, tạo mới
            latestData = await db.MedicalData.create({
                type: 'text', 
                content: content,
            });
            return res.status(201).json({
                err: 0,
                mess: 'Medical data created successfully',
                data: latestData,
            });
        }

        // Cập nhật nội dung
        latestData.content = content;
        await latestData.save();

        res.status(200).json({
            err: 0,
            mess: 'Medical data updated successfully',
            data: latestData,
        });
    } catch (error) {
        console.error('Error updating medical data:', error);
        res.status(500).json({ err: 1, mess: 'An error occurred while updating the medical data' });
    }
};

export const getAllUrls = async (req, res) => {
    try {
        // Lấy tất cả các bản ghi với type là 'url'
        const urls = await db.MedicalData.findAll({
            where: { type: 'url' },
            attributes: ['url', 'createdAt'], // Chỉ lấy các trường cần thiết
        });

        if (!urls.length) {
            return res.status(404).json({
                err: 1,
                mess: 'No URLs found',
                data: [],
            });
        }

        res.status(200).json({
            err: 0,
            mess: 'URLs fetched successfully',
            data: urls,
        });
    } catch (error) {
        console.error('Error fetching URLs:', error);
        res.status(500).json({
            err: 1,
            mess: 'An error occurred while fetching URLs',
        });
    }
};