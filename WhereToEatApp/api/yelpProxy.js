// api/yelp.js
const axios = require('axios');

module.exports = async (req, res) => {
  const { endpoint, ...params } = req.query;

  try {
    const response = await axios.get(`https://api.yelp.com/v3/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY || ''}`,
      },
      params,
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || 'Internal server error');
  }
};
