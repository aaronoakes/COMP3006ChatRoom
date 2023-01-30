export default {
  login: async (req, res) => {
    return res.status(200).json({
      success: true,
      authorization: req.authToken,
    });
  },
};
