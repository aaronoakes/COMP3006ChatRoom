import UserModel from "../models/user.js";

export default {
  createUser: async (req, res) => {
    try {
      // TODO: could enhance to add validation

      const { username, firstName, lastName } = req.body;
      const user = await UserModel.createUser(username, firstName, lastName);
      return res.status(200).json({ success: true, user });
    } catch (error) {
      // it's all gone Pete, so return an error response
      return res.status(500).json({ success: false, error: error });
    }
  },
  getUserById: async (req, res) => {
    try {
      const user = await UserModel.getUserById(req.params.id);
      return res.status(200).json({ success: true, user });
    } catch (error) {
      // oops!
      return res.status(500).json({ success: false, error: error });
    }
  },
  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.getUsers();
      return res.status(200).json({ success: true, users });
    } catch (error) {
      return res.status(500).json({ success: false, error: error });
    }
  },
  deleteUserById: async (req, res) => {
    try {
      const user = await UserModel.deleteUserById(req.params.id);
      return res.status(200).json({
        success: true,
        message: `Deleted ${user.deletedCount} user.`,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error });
    }
  }
};
