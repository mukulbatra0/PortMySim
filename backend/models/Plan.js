const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  operator: {
    type: String,
    required: true,
    enum: ['jio', 'airtel', 'vi', 'bsnl']
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  data: {
    type: String,
    required: true
  },
  data_value: {
    type: Number, // Numeric value for comparison (e.g., 2 for "2GB/day")
    required: true
  },
  validity: {
    type: Number, // In days
    required: true
  },
  voice_calls: {
    type: String,
    default: 'Unlimited'
  },
  sms: {
    type: String,
    default: '100/day'
  },
  has_5g: {
    type: Boolean,
    default: false
  },
  subscriptions: [{
    type: String
  }],
  network_coverage: {
    type: Number, // Percentage
    min: 0,
    max: 100
  },
  data_speed: {
    type: Number // in Mbps
  },
  extra_benefits: [{
    type: String
  }],
  plan_type: {
    type: String,
    enum: ['prepaid', 'postpaid'],
    required: true
  },
  data_category: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  price_category: {
    type: String,
    enum: ['budget', 'mid', 'premium'],
    required: true
  },
  validity_category: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual'],
    required: true
  },
  image: {
    type: String, // URL to operator logo
    required: true
  },
  recommendation: {
    type: String,
    enum: ['', 'Best Value', 'Widest Coverage', 'Budget Choice', 'Best Data']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updated_at field
planSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to calculate value score based on various factors
planSchema.methods.calculateValueScore = function() {
  // Basic formula: (data * validity) / price
  const dataValue = this.data_value;
  const valueScore = ((dataValue * this.validity) / this.price) * 10;
  
  // Add bonuses for extra features
  const fiveGBonus = this.has_5g ? 0.5 : 0;
  const subscriptionsBonus = this.subscriptions.length * 0.3;
  const coverageBonus = (this.network_coverage / 100) * 0.5;
  
  // Calculate final score (cap at 10)
  return Math.min(Math.round((valueScore + fiveGBonus + subscriptionsBonus + coverageBonus) * 10) / 10, 10);
};

// Static method to compare plans
planSchema.statics.comparePlans = async function(planIds) {
  try {
    const plans = await this.find({ _id: { $in: planIds } });
    
    if (!plans.length) {
      return { error: 'No plans found' };
    }
    
    // Calculate value scores
    const valueScores = plans.map(plan => ({
      id: plan._id,
      score: plan.calculateValueScore()
    }));
    
    // Determine best values for each feature
    const features = {
      daily_data: determineBest(plans, 'data_value', 'highest'),
      validity: determineBest(plans, 'validity', 'highest'),
      price: determineBest(plans, 'price', 'lowest'),
      coverage: determineBest(plans, 'network_coverage', 'highest'),
      speed: determineBest(plans, 'data_speed', 'highest')
    };
    
    return {
      plans,
      valueScores,
      features
    };
  } catch (error) {
    return { error: error.message };
  }
};

// Helper function to determine which plans have the best value for a feature
function determineBest(plans, feature, mode) {
  // Skip if no plans or missing feature
  if (!plans.length || !plans[0][feature]) {
    return plans.map(() => false);
  }
  
  let bestValue;
  
  if (mode === 'highest') {
    bestValue = Math.max(...plans.map(p => p[feature]));
    return plans.map(p => p[feature] >= bestValue);
  } else if (mode === 'lowest') {
    bestValue = Math.min(...plans.map(p => p[feature]));
    return plans.map(p => p[feature] <= bestValue);
  }
  
  return plans.map(() => false);
}

module.exports = mongoose.model('Plan', planSchema); 