const User = require('../models/User');

module.exports = {
    getUser: async (req, res) => {
        try {
            const user = await User.findById(req.user.id)
            const { password, __v, createAt, ...userData } = user._doc;

            res.status(200).json(userData)
        } catch (error) {

            res.status(500).json(error)
        }
    },
    delete: async (req, res) => {
        try {
            const userId = req.params.id; 
    
            await User.findByIdAndDelete(userId); 
            res.status(200).json('User successfully deleted');
        } catch (error) {
            res.status(500).json(error);
        }
    },
}