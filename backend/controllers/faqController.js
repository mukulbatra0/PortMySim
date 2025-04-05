const FAQ = require('../models/FAQ.model');

/**
 * Get all FAQs
 * @route GET /api/faqs
 * @access Public
 */
exports.getAllFAQs = async (req, res) => {
  try {
    let query = {};
    
    // Add category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Add isActive filter (default to true)
    query.isActive = req.query.include_inactive === 'true' ? { $in: [true, false] } : true;
    
    // Find FAQs
    const faqs = await FAQ.find(query).sort({ category: 1, order: 1 });
    
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
  }
};

/**
 * Get FAQs by category
 * @route GET /api/faqs/categories/:category
 * @access Public
 */
exports.getFAQsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validate category
    const validCategories = ['general', 'porting', 'billing', 'plans', 'technical'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    // Find FAQs by category
    const faqs = await FAQ.find({
      category,
      isActive: true
    }).sort({ order: 1 });
    
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
  }
};

/**
 * Search FAQs
 * @route GET /api/faqs/search
 * @access Public
 */
exports.searchFAQs = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Create text search
    const faqs = await FAQ.find({
      $text: { $search: query },
      isActive: true
    });
    
    // If no results from text search, try regex search
    if (faqs.length === 0) {
      const regexFaqs = await FAQ.find({
        $or: [
          { question: { $regex: query, $options: 'i' } },
          { answer: { $regex: query, $options: 'i' } }
        ],
        isActive: true
      });
      
      return res.status(200).json(regexFaqs);
    }
    
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error searching FAQs', error: error.message });
  }
};

/**
 * Get frequently asked FAQs (top N by order)
 * @route GET /api/faqs/top
 * @access Public
 */
exports.getTopFAQs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Get top FAQs from each category
    const faqs = await FAQ.aggregate([
      { $match: { isActive: true } },
      { $sort: { order: 1 } },
      { $group: { _id: '$category', faqs: { $push: '$$ROOT' } } },
      { $project: { _id: 0, category: '$_id', faqs: { $slice: ['$faqs', 2] } } },
      { $unwind: '$faqs' },
      { $replaceRoot: { newRoot: '$faqs' } },
      { $sort: { order: 1 } },
      { $limit: limit }
    ]);
    
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top FAQs', error: error.message });
  }
}; 