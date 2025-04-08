import Plan from '../models/Plan.js';
import * as planHelper from '../utils/planHelper.js';

/**
 * Get all plans with optional filtering
 */
const getPlans = async (req, res) => {
  try {
    const filters = {};
    
    // Apply filters if provided
    if (req.query.operator) filters.operator = req.query.operator;
    if (req.query.plan_type) filters.plan_type = req.query.plan_type;
    if (req.query.data_category) filters.data_category = req.query.data_category;
    if (req.query.price_category) filters.price_category = req.query.price_category;
    if (req.query.validity_category) filters.validity_category = req.query.validity_category;
    
    // Price range filter
    if (req.query.min_price && req.query.max_price) {
      filters.price = { 
        $gte: parseInt(req.query.min_price),
        $lte: parseInt(req.query.max_price)
      };
    } else if (req.query.min_price) {
      filters.price = { $gte: parseInt(req.query.min_price) };
    } else if (req.query.max_price) {
      filters.price = { $lte: parseInt(req.query.max_price) };
    }
    
    // Get plans with filters
    const plans = await Plan.find(filters);
    
    // Return plans with basic details only
    const simplifiedPlans = plans.map(plan => ({
      id: plan._id,
      operator: plan.operator,
      name: plan.name,
      price: plan.price,
      data: plan.data,
      validity: plan.validity,
      has_5g: plan.has_5g,
      plan_type: plan.plan_type,
      image: plan.image,
      recommendation: plan.recommendation
    }));
    
    res.status(200).json(simplifiedPlans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

/**
 * Get a single plan by ID
 */
const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plan', error: error.message });
  }
};

/**
 * Get plans by operator
 */
const getPlansByOperator = async (req, res) => {
  try {
    const operator = req.params.operator;
    
    // Validate operator
    if (!['jio', 'airtel', 'vi', 'bsnl'].includes(operator)) {
      return res.status(400).json({ message: 'Invalid operator' });
    }
    
    const plans = await Plan.find({ operator });
    
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching operator plans', error: error.message });
  }
};

/**
 * Compare multiple plans
 */
const comparePlans = async (req, res) => {
  try {
    // Get plan IDs from either query params or request body
    const planIds = req.query.ids ? req.query.ids.split(',') : req.body.planIds;
    
    if (!planIds || !Array.isArray(planIds) || planIds.length < 2) {
      return res.status(400).json({ 
        message: 'Please provide at least 2 valid plan IDs to compare' 
      });
    }
    
    if (planIds.length > 3) {
      return res.status(400).json({
        message: 'Maximum 3 plans can be compared at once'
      });
    }
    
    // Get plans by IDs
    const plans = await Plan.find({ _id: { $in: planIds } });
    
    if (plans.length !== planIds.length) {
      return res.status(400).json({ 
        message: 'One or more plan IDs are invalid',
        invalidIds: planIds.filter(id => !plans.some(p => p._id.toString() === id))
      });
    }
    
    // Calculate value scores for each plan
    const valueScores = plans.map(plan => ({
      id: plan._id,
      score: plan.calculateValueScore()
    }));
    
    // Determine best values for each feature
    const features = {
      daily_data: determineBestFeature(plans, 'data_value', 'highest'),
      validity: determineBestFeature(plans, 'validity', 'highest'),
      price: determineBestFeature(plans, 'price', 'lowest'),
      coverage: determineBestFeature(plans, 'network_coverage', 'highest'),
      speed: determineBestFeature(plans, 'data_speed', 'highest'),
      has_5g: plans.map(plan => plan.has_5g),
      subscriptions: plans.map(plan => plan.subscriptions.length)
    };

    // Generate comparison summary
    const summary = generateComparisonSummary(plans, valueScores, features);
    
    res.status(200).json({
      plans,
      valueScores,
      features,
      summary
    });
  } catch (error) {
    console.error('Error comparing plans:', error);
    res.status(500).json({ 
      message: 'Error comparing plans', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get plans for comparison based on criteria
 */
const getSimilarPlans = async (req, res) => {
  try {
    const { planId, priceRange = 200, operator } = req.query;
    
    if (!planId && !operator) {
      return res.status(400).json({ 
        message: 'Please provide either a plan ID or operator to find similar plans' 
      });
    }
    
    let basePlan;
    let query = {};
    
    // If planId is provided, find similar plans based on price
    if (planId) {
      basePlan = await Plan.findById(planId);
      
      if (!basePlan) {
        return res.status(404).json({ message: 'Plan not found' });
      }
      
      // Find plans with similar price range but different operators
      query = {
        _id: { $ne: planId }, // Exclude the reference plan
        operator: { $ne: basePlan.operator }, // Different operator
        price: { 
          $gte: basePlan.price - priceRange, 
          $lte: basePlan.price + priceRange 
        }
      };
    } else if (operator) {
      // If only operator is provided, get plans from that operator
      query = { operator };
    }
    
    // Get plans based on query
    const similarPlans = await Plan.find(query).limit(6);
    
    res.status(200).json({
      referencePlan: basePlan,
      similarPlans
    });
  } catch (error) {
    res.status(500).json({ message: 'Error finding similar plans', error: error.message });
  }
};

/**
 * Determine which plans have the best value for a feature
 */
function determineBestFeature(plans, feature, mode) {
  // Skip if no plans or missing feature
  if (!plans.length || !plans[0][feature]) {
    return plans.map(() => false);
  }
  
  let bestValue;
  
  if (mode === 'highest') {
    bestValue = Math.max(...plans.map(p => p[feature]));
    return plans.map(p => p[feature] >= bestValue * 0.95); // Consider within 5% of the best as also "best"
  } else if (mode === 'lowest') {
    bestValue = Math.min(...plans.map(p => p[feature]));
    return plans.map(p => p[feature] <= bestValue * 1.05); // Consider within 5% of the lowest as also "best"
  }
  
  return plans.map(() => false);
}

/**
 * Generate a text summary of the comparison
 */
function generateComparisonSummary(plans, valueScores, features) {
  const planNames = plans.map(p => `${p.operator.toUpperCase()} ${p.name}`);
  let summary = `Comparing ${planNames.join(', ')}:\n`;
  
  // Find the best value score
  const bestValueScore = Math.max(...valueScores.map(v => v.score));
  const bestValuePlanIndex = valueScores.findIndex(v => v.score === bestValueScore);
  
  // Add value score summary
  summary += `\n- ${planNames[bestValuePlanIndex]} offers the best overall value with a score of ${bestValueScore.toFixed(1)}/10.\n`;
  
  // Add data comparison
  const bestDataIndex = features.daily_data.findIndex(v => v);
  if (bestDataIndex !== -1) {
    summary += `- ${planNames[bestDataIndex]} provides the most data (${plans[bestDataIndex].data}).\n`;
  }
  
  // Add price comparison
  const bestPriceIndex = features.price.findIndex(v => v);
  if (bestPriceIndex !== -1) {
    summary += `- ${planNames[bestPriceIndex]} is the most affordable at ₹${plans[bestPriceIndex].price}.\n`;
  }
  
  // Add validity comparison
  const bestValidityIndex = features.validity.findIndex(v => v);
  if (bestValidityIndex !== -1) {
    summary += `- ${planNames[bestValidityIndex]} has the longest validity (${plans[bestValidityIndex].validity} days).\n`;
  }
  
  // Add 5G availability
  const with5G = plans.filter(p => p.has_5g);
  if (with5G.length > 0) {
    if (with5G.length === plans.length) {
      summary += "- All plans offer 5G connectivity.\n";
    } else {
      const with5GNames = with5G.map(p => `${p.operator.toUpperCase()} ${p.name}`);
      summary += `- Only ${with5GNames.join(', ')} offer 5G connectivity.\n`;
    }
  }
  
  return summary;
}

/**
 * Create a new plan
 */
const createPlan = async (req, res) => {
  try {
    const {
      operator,
      name,
      price,
      data,
      validity,
      voice_calls,
      sms,
      has_5g,
      subscriptions,
      network_coverage,
      data_speed,
      extra_benefits,
      plan_type,
      recommendation
    } = req.body;
    
    // Calculate derived fields
    const data_value = planHelper.parseDataValue(data);
    const data_category = planHelper.getDataCategory(data);
    const price_category = planHelper.getPriceCategory(price);
    const validity_category = planHelper.getValidityCategory(validity);
    const image = planHelper.getOperatorImage(operator);
    
    // Create plan with all required fields
    const plan = new Plan({
      operator,
      name,
      price,
      data,
      data_value,
      validity,
      voice_calls: voice_calls || 'Unlimited',
      sms: sms || '100/day',
      has_5g: has_5g || false,
      subscriptions: subscriptions || [],
      network_coverage: network_coverage || 0,
      data_speed: data_speed || 0,
      extra_benefits: extra_benefits || [],
      plan_type,
      data_category,
      price_category,
      validity_category,
      image,
      recommendation: recommendation || ''
    });
    
    const savedPlan = await plan.save();
    
    res.status(201).json(savedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating plan', error: error.message });
  }
};

/**
 * Update an existing plan
 */
const updatePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const updateData = { ...req.body };
    
    // Update derived fields if base fields change
    if (updateData.data) {
      updateData.data_value = planHelper.parseDataValue(updateData.data);
      updateData.data_category = planHelper.getDataCategory(updateData.data);
    }
    
    if (updateData.price) {
      updateData.price_category = planHelper.getPriceCategory(updateData.price);
    }
    
    if (updateData.validity) {
      updateData.validity_category = planHelper.getValidityCategory(updateData.validity);
    }
    
    if (updateData.operator) {
      updateData.image = planHelper.getOperatorImage(updateData.operator);
    }
    
    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.status(200).json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating plan', error: error.message });
  }
};

/**
 * Delete a plan
 */
const deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    
    const deletedPlan = await Plan.findByIdAndDelete(planId);
    
    if (!deletedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plan', error: error.message });
  }
};

/**
 * Get recommended plans
 * @route GET /api/plans/recommended
 * @access Public
 */
const getRecommendedPlans = async (req, res) => {
  try {
    // Find plans with recommendations first
    let recommendedPlans = [];
    
    try {
      recommendedPlans = await Plan.find({ 
        recommendation: { $ne: '' } 
      }).limit(3);
      
      // If we don't have enough plans with recommendations, get some popular plans
      if (recommendedPlans.length < 3) {
        // Find plans based on a mix of operators and price categories
        const additionalPlans = await Plan.find({
          _id: { $nin: recommendedPlans.map(p => p._id) } // Exclude already found plans
        }).sort({ price: -1 }).limit(3 - recommendedPlans.length);
        
        recommendedPlans = [...recommendedPlans, ...additionalPlans];
      }
    } catch (dbError) {
      console.warn('Database error in getRecommendedPlans:', dbError.message);
      // Use fallback static data if database is not available
      const fallbackPlans = require('../data/plans');
      // Find plans with recommendations in the fallback data
      const plansWithRecommendations = fallbackPlans.filter(p => p.recommendation && p.recommendation !== '');
      // Ensure we have at least 3 plans, use any plan if not enough recommended ones exist
      recommendedPlans = plansWithRecommendations.length >= 3 
        ? plansWithRecommendations.slice(0, 3) 
        : [...plansWithRecommendations, ...fallbackPlans.filter(p => !p.recommendation || p.recommendation === '').slice(0, 3 - plansWithRecommendations.length)];
      
      // Convert plain objects to Plan models
      recommendedPlans = recommendedPlans.map(plan => new Plan(plan));
    }
    
    // Assign recommendations if not already set
    recommendedPlans = recommendedPlans.map(plan => {
      if (!plan.recommendation || plan.recommendation === '') {
        // Determine a recommendation based on plan attributes
        if (plan.data_category === 'high') {
          plan.recommendation = 'Best Data';
        } else if (plan.price_category === 'budget') {
          plan.recommendation = 'Budget Choice';
        } else if (plan.network_coverage > 95) {
          plan.recommendation = 'Widest Coverage';
        } else {
          plan.recommendation = 'Best Value';
        }
      }
      return plan;
    });
    
    // Ensure we never return fewer than 3 plans
    if (recommendedPlans.length < 3) {
      console.warn("Not enough plans found, returning available plans");
    }
    
    res.status(200).json(recommendedPlans);
  } catch (error) {
    console.error('Error fetching recommended plans:', error);
    res.status(500).json({ 
      message: 'Error fetching recommended plans', 
      error: error.message 
    });
  }
};

export default {
  getPlans,
  getPlanById,
  getPlansByOperator,
  comparePlans,
  getSimilarPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getRecommendedPlans
}; 