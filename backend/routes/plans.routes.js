const express = require('express');
const router = express.Router();
const plans = require('../data/plans');

// Define plans routes
// These will be fully implemented in Step 6

// @route   GET /api/plans
// @desc    Get all plans
// @access  Public
router.get('/', (req, res) => {
  try {
    // Filter plans based on query parameters
    let filteredPlans = [...plans];
    
    if (req.query.operator) {
      filteredPlans = filteredPlans.filter(plan => 
        plan.operator.toLowerCase() === req.query.operator.toLowerCase());
    }
    
    if (req.query.priceMin && req.query.priceMax) {
      filteredPlans = filteredPlans.filter(plan => 
        plan.price >= parseInt(req.query.priceMin) && 
        plan.price <= parseInt(req.query.priceMax));
    }
    
    if (req.query.dataCategory) {
      filteredPlans = filteredPlans.filter(plan => 
        plan.data_category === req.query.dataCategory);
    }
    
    if (req.query.validityCategory) {
      filteredPlans = filteredPlans.filter(plan => 
        plan.validity_category === req.query.validityCategory);
    }
    
    res.json(filteredPlans);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/plans/:id
// @desc    Get a specific plan
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const plan = plans.find(p => p.name === req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/operators/:operator/plans
// @desc    Get plans for a specific operator
// @access  Public
router.get('/provider/:provider', (req, res) => {
  try {
    const operatorPlans = plans.filter(plan => 
      plan.operator.toLowerCase() === req.params.provider.toLowerCase()
    );
    
    if (operatorPlans.length === 0) {
      return res.status(404).json({ message: 'No plans found for this operator' });
    }
    
    res.json(operatorPlans);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// For compatibility with the frontend API calls
router.get('/operators/:operator/plans', (req, res) => {
  try {
    const operatorPlans = plans.filter(plan => 
      plan.operator.toLowerCase() === req.params.operator.toLowerCase()
    );
    
    if (operatorPlans.length === 0) {
      return res.status(404).json({ message: 'No plans found for this operator' });
    }
    
    res.json(operatorPlans);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/plans/compare
// @desc    Compare multiple plans
// @access  Public
router.post('/compare', (req, res) => {
  try {
    const { planIds } = req.body;
    
    if (!planIds || !Array.isArray(planIds) || planIds.length < 2) {
      return res.status(400).json({ message: 'Please provide at least 2 plan IDs to compare' });
    }
    
    const plansToCompare = plans.filter(plan => planIds.includes(plan.name));
    
    if (plansToCompare.length !== planIds.length) {
      return res.status(404).json({ message: 'One or more plans not found' });
    }
    
    // Calculate value scores based on data, price, and other factors
    const valueScores = plansToCompare.map(plan => {
      const dataScore = plan.data_value / 30;
      const priceScore = 1000 / plan.price;
      const validityScore = plan.validity / 30;
      const featuresScore = (plan.has_5g ? 2 : 0) + (plan.subscriptions.length * 0.5);
      
      const totalScore = (dataScore * 3 + priceScore * 2 + validityScore + featuresScore) / 7;
      return { score: parseFloat((totalScore * 10).toFixed(1)) };
    });
    
    res.json({
      plans: plansToCompare,
      valueScores,
      summary: generateComparisonSummary(plansToCompare)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/plans/recommended
// @desc    Get recommended plans
// @access  Public
router.get('/recommended', (req, res) => {
  try {
    // Filter plans with recommendations
    const recommendedPlans = plans.filter(plan => plan.recommendation !== '');
    
    res.json(recommendedPlans);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Helper function to generate comparison summary
function generateComparisonSummary(plans) {
  // Find the best value plan
  const bestValuePlan = plans.reduce((best, current) => {
    const bestRatio = best.data_value / best.price;
    const currentRatio = current.data_value / current.price;
    return currentRatio > bestRatio ? current : best;
  }, plans[0]);
  
  // Find plan with most data
  const mostDataPlan = plans.reduce((most, current) => {
    return current.data_value > most.data_value ? current : most;
  }, plans[0]);
  
  // Find the cheapest plan
  const cheapestPlan = plans.reduce((cheapest, current) => {
    return current.price < cheapest.price ? current : cheapest;
  }, plans[0]);
  
  return `Based on our analysis, ${bestValuePlan.name} offers the best value for money at ₹${bestValuePlan.price}. ${mostDataPlan.name} provides the most data at ${mostDataPlan.data}. If budget is your primary concern, ${cheapestPlan.name} is the most affordable option at ₹${cheapestPlan.price}.`;
}

module.exports = router; 